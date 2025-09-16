import ReportPageLayout from '@/components/ReportPageLayout'

export default function PotholeReportPage() {
  return (
    <ReportPageLayout
      category="pothole"
      title="Report Potholes"
      description="Document road damage, potholes, and surface issues that impact vehicle safety and traffic flow."
      defaultCategory="pothole"
    />
  )
}