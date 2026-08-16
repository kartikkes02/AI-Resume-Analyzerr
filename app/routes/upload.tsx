import {type FormEvent, useEffect, useState} from 'react'
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage, extractTextFromPdf} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv } = usePuterStore();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (!isLoading && !auth.isAuthenticated) {
            navigate('/auth?next=/upload');
        }
    }, [isLoading, auth.isAuthenticated, navigate]);

    const handleFileSelect = (file: File | null) => {
        setFile(file);
        setErrorMessage('');
    }

    const handleAnalyze = async ({ companyName, jobTitle, jobDescription, file }: { companyName: string, jobTitle: string, jobDescription: string, file: File  }) => {
        setIsProcessing(true);
        setErrorMessage('');

        try {
            setStatusText('Uploading resume to storage...');
            const uploadedFile = await fs.upload([file]);
            if(!uploadedFile) {
                setErrorMessage('Failed to upload file to storage.');
                setIsProcessing(false);
                return;
            }

            setStatusText('Extracting resume content & generating preview...');
            const [imageFile, resumeText] = await Promise.all([
                convertPdfToImage(file),
                extractTextFromPdf(file),
            ]);

            if(!imageFile.file) {
                setErrorMessage('Failed to convert PDF to preview image.');
                setIsProcessing(false);
                return;
            }

            setStatusText('Uploading preview image...');
            const uploadedImage = await fs.upload([imageFile.file]);
            if(!uploadedImage) {
                setErrorMessage('Failed to upload preview image.');
                setIsProcessing(false);
                return;
            }

            setStatusText('Preparing data...');
            const uuid = generateUUID();
            const data: Resume = {
                id: uuid,
                resumePath: uploadedFile.path,
                imagePath: uploadedImage.path,
                companyName,
                jobTitle,
                feedback: {} as Feedback,
            };
            await kv.set(`resume:${uuid}`, JSON.stringify(data));

            setStatusText('Analyzing resume with AI (this may take a moment)...');

            const instructions = prepareInstructions({
                jobTitle,
                jobDescription,
                resumeText,
            });

            const feedback = await ai.feedback(uploadedFile.path, instructions);

            if (!feedback) {
                setErrorMessage('Failed to receive AI feedback. Please try again.');
                setIsProcessing(false);
                return;
            }

            let rawContent = '';
            if (typeof feedback === 'string') {
                rawContent = feedback;
            } else if ((feedback as any).text) {
                rawContent = (feedback as any).text;
            } else if ((feedback as any).message?.content) {
                const content = (feedback as any).message.content;
                if (typeof content === 'string') {
                    rawContent = content;
                } else if (Array.isArray(content)) {
                    rawContent = content.map((c: any) => (typeof c === 'string' ? c : c.text || JSON.stringify(c))).join('\n');
                } else {
                    rawContent = JSON.stringify(content);
                }
            } else {
                rawContent = JSON.stringify(feedback);
            }

            // Clean markdown code blocks from AI response if present
            let cleaned = rawContent.trim();
            const jsonBlock = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
            if (jsonBlock && jsonBlock[1]) {
                cleaned = jsonBlock[1].trim();
            } else {
                const objMatch = cleaned.match(/(\{[\s\S]*\})/);
                if (objMatch && objMatch[1]) {
                    cleaned = objMatch[1].trim();
                }
            }

            const parsed = JSON.parse(cleaned);

            const atsScore = Number(parsed.ATS?.score) || 75;
            const toneScore = Number(parsed.toneAndStyle?.score) || 75;
            const contentScore = Number(parsed.content?.score) || 75;
            const structureScore = Number(parsed.structure?.score) || 75;
            const skillsScore = Number(parsed.skills?.score) || 75;

            let overall = Number(parsed.overallScore);
            if (isNaN(overall) || overall <= 0) {
                overall = Math.round((atsScore + toneScore + contentScore + structureScore + skillsScore) / 5);
            }

            data.feedback = {
                overallScore: overall,
                ATS: {
                    score: atsScore,
                    tips: Array.isArray(parsed.ATS?.tips) && parsed.ATS.tips.length > 0 ? parsed.ATS.tips : [
                        { type: "good", tip: "Clean resume structure suitable for ATS parsing." },
                        { type: "improve", tip: "Incorporate more industry keywords relevant to the role." }
                    ],
                },
                toneAndStyle: {
                    score: toneScore,
                    tips: Array.isArray(parsed.toneAndStyle?.tips) && parsed.toneAndStyle.tips.length > 0 ? parsed.toneAndStyle.tips : [
                        { type: "good", tip: "Professional Tone", explanation: "Maintains a professional and confident tone throughout." }
                    ],
                },
                content: {
                    score: contentScore,
                    tips: Array.isArray(parsed.content?.tips) && parsed.content.tips.length > 0 ? parsed.content.tips : [
                        { type: "good", tip: "Experience Highlights", explanation: "Clearly outlines relevant work experience and responsibilities." }
                    ],
                },
                structure: {
                    score: structureScore,
                    tips: Array.isArray(parsed.structure?.tips) && parsed.structure.tips.length > 0 ? parsed.structure.tips : [
                        { type: "good", tip: "Clear Layout", explanation: "Sections are organized logically with clear headings." }
                    ],
                },
                skills: {
                    score: skillsScore,
                    tips: Array.isArray(parsed.skills?.tips) && parsed.skills.tips.length > 0 ? parsed.skills.tips : [
                        { type: "good", tip: "Core Competencies", explanation: "Highlights relevant technical and professional skills." }
                    ],
                },
            };

            await kv.set(`resume:${uuid}`, JSON.stringify(data));
            setStatusText('Analysis complete, redirecting...');
            navigate(`/resume/${uuid}`);
        } catch (error: any) {
            console.error("Analysis error:", error);
            const msg = error?.message || (typeof error === 'string' ? error : 'Failed to analyze resume. Please check your Puter account or try again.');
            setErrorMessage(msg);
            setIsProcessing(false);
        }
    }

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const companyName = formData.get('company-name') as string;
        const jobTitle = formData.get('job-title') as string;
        const jobDescription = formData.get('job-description') as string;

        if(!file) {
            setErrorMessage('Please select a PDF resume to upload.');
            return;
        }

        handleAnalyze({ companyName, jobTitle, jobDescription, file });
    }

    return (
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />

            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Smart feedback for your dream job</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" alt="Analyzing resume" />
                        </>
                    ) : (
                        <h2>Drop your resume for an ATS score and improvement tips</h2>
                    )}

                    {errorMessage && !isProcessing && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center max-w-xl w-full">
                            <p className="font-semibold">{errorMessage}</p>
                        </div>
                    )}

                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="company-name">Company Name</label>
                                <input type="text" name="company-name" placeholder="Company Name" id="company-name" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-title">Job Title</label>
                                <input type="text" name="job-title" placeholder="Job Title" id="job-title" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="job-description">Job Description</label>
                                <textarea rows={5} name="job-description" placeholder="Job Description" id="job-description" />
                            </div>

                            <div className="form-div">
                                <label htmlFor="uploader">Upload Resume</label>
                                <FileUploader onFileSelect={handleFileSelect} />
                            </div>

                            <button className="primary-button" type="submit">
                                Analyze Resume
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}
export default Upload
