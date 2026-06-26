import { getAllInterviewReports, generateInterviewReport, getInterviewReportById, generateResumePdf } from "../services/interview.api"
import { useContext, useRef } from "react"
import { InterviewContext } from "../interview.context"
import { useParams } from "react-router"


export const useInterview = () => {

    const context = useContext(InterviewContext)
    const { interviewId } = useParams()
    const requestLock = useRef(false)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        if (requestLock.current) return null;
        requestLock.current = true;
        
        setLoading(true)
        let response = null
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile })
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
        } catch (error) {
            console.error("Error generating report:", error)
        } finally {
            setLoading(false)
            requestLock.current = false;
        }

        return null
    }

    const getReportById = async (id) => {
        if (requestLock.current) return null;
        requestLock.current = true;
        
        setLoading(true)
        try {
            const response = await getInterviewReportById(id)
            if (response && response.interviewReport) {
                setReport(response.interviewReport)
                return response.interviewReport
            }
        } catch (error) {
            console.error("Error fetching report by ID:", error)
        } finally {
            setLoading(false)
            requestLock.current = false;
        }
        return null
    }

    const getReports = async () => {
        if (requestLock.current) return null;
        requestLock.current = true;
        
        setLoading(true)
        try {
            const response = await getAllInterviewReports()
            if (response && response.interviewReports) {
                setReports(response.interviewReports)
                return response.interviewReports
            }
        } catch (error) {
            console.error("Error fetching reports:", error)
        } finally {
            setLoading(false)
            requestLock.current = false;
        }

        return null
    }

    const getResumePdf = async (interviewReportId) => {
        if (requestLock.current) return;
        requestLock.current = true;
        
        setLoading(true)
        try {
            const response = await generateResumePdf({ interviewReportId })
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
        }
        catch (error) {
            console.error("Error generating PDF:", error)
        } finally {
            setLoading(false)
            requestLock.current = false;
        }
    }

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }

}
