# Student Progress Report - Usage Guide

## Quick Start

### For Developers

**1. Add route to your application**:
```tsx
// src/app/[slug]/(dashboard)/students/[studentId]/progress/page.tsx
import { StudentAnalyticsPage } from "@/components/analytics/StudentAnalyticsPage";

export default function StudentProgressPage({ params }) {
    return <StudentAnalyticsPage studentId={params.studentId} />;
}
```

**2. Use analytics action directly**:
```tsx
import { getStudentAnalyticsAction } from "@/app/actions/student-analytics-actions";

const result = await getStudentAnalyticsAction(studentId);
if (result.success) {
    console.log(result.data.insights); // AI insights
    console.log(result.data.academic); // Academic performance
}
```

### For Users

**Accessing the Dashboard**:
1. Navigate to: `/[school-slug]/students/[student-id]/progress`
2. View comprehensive analytics dashboard
3. Click "Print Report" for A4 printable version

**Dashboard Sections**:
- **AI Insights**: Personalized recommendations and observations
- **Academic Performance**: Grades, charts, and subject breakdown
- **Attendance**: Visual attendance statistics
- **Health**: Latest health metrics and growth trends
- **Activities**: Co-curricular achievements

## Features

### AI Insights
- ✅ Academic excellence detection
- ⚠️ Performance concerns
- 📈 Improvement trends
- 🏆 Achievement recognition
- 💪 Strength identification
- 📉 Weakness detection

### Charts & Visualizations
- Bar charts for subject performance
- Radar charts for subject balance
- Line charts for growth trends
- Circular progress for attendance
- Color-coded status indicators

### Print Features
- A4 portrait layout
- Professional formatting
- Print-optimized spacing
- Color preservation
- Page break controls

## API Reference

### getStudentAnalyticsAction

```typescript
async function getStudentAnalyticsAction(
    studentId: string
): Promise<{
    success: boolean;
    data?: StudentAnalytics;
    error?: string;
}>
```

**Returns**:
```typescript
interface StudentAnalytics {
    student: {
        id: string;
        name: string;
        grade: string;
        avatar?: string;
        admissionNumber?: string;
    };
    academic: {
        subjects: SubjectPerformance[];
        overallPercentage: number;
        overallGrade: string;
        trend: 'improving' | 'declining' | 'stable';
        consistencyScore: number;
    };
    attendance: AttendanceStats;
    health: HealthMetrics;
    activities: ActivitySummary;
    insights: AIInsight[];
}
```

## Customization

### Adding Custom Insights

Edit `src/app/actions/student-analytics-actions.ts`:

```typescript
function generateInsights(analytics) {
    const insights: AIInsight[] = [];
    
    // Add your custom rule
    if (analytics.academic.overallPercentage > 95) {
        insights.push({
            type: 'achievement',
            category: 'academic',
            title: 'Top Performer',
            description: 'Exceptional academic achievement!',
            severity: 'low'
        });
    }
    
    return insights;
}
```

### Styling Print Layout

Edit print styles in `StudentAnalyticsPage.tsx`:

```css
@media print {
    @page {
        size: A4 portrait;
        margin: 15mm; /* Adjust margins */
    }
    
    /* Custom print styles */
}
```

## Troubleshooting

### No data showing
- Ensure student has exam results, attendance records
- Check database relationships are properly set up
- Verify studentId is correct

### Print layout issues
- Check browser print settings (Chrome recommended)
- Ensure "Background graphics" is enabled
- Try print preview before printing

### Charts not rendering
- Verify `recharts` is installed: `npm install recharts`
- Check console for errors
- Ensure data is in correct format

## Examples

### Example 1: High Performer
```
Overall: 92.5% (A+)
Insights:
- ✅ Excellent Academic Performance
- ✅ Outstanding Attendance (98%)
- 🏆 Multiple Co-curricular Awards
```

### Example 2: Needs Support
```
Overall: 45.2% (D)
Insights:
- ⚠️ Academic Support Needed
- ⚠️ Attendance Below 75%
- 📈 Showing Improvement in Math
```

## Next Steps

1. Test with real student data
2. Customize insights for your needs
3. Add school branding to print layout
4. Set up automated report generation
5. Integrate with parent portal

## Support

For issues or questions:
- Check implementation plan: `implementation_plan.md`
- Review walkthrough: `walkthrough.md`
- Examine source code in `src/components/analytics/`
