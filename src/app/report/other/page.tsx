import ReportPageLayout from '@/components/ReportPageLayout'

export default function OtherReportPage() {
  return (
    <ReportPageLayout
      category="other"
      title="Report Other Issues"
      description="Report street lights, graffiti, vandalism, and other civic concerns that need attention."
      defaultCategory="other"
    />
  )
}