import ReportPageLayout from '@/components/ReportPageLayout'

export default function GarbageReportPage() {
  return (
    <ReportPageLayout
      category="garbage"
      title="Report Garbage Dumps"
      description="Report illegal dumping, overflowing bins, and litter that affects community cleanliness and health."
      defaultCategory="garbage"
    />
  )
}