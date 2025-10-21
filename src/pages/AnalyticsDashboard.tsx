import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const AnalyticsDashboard = () => {
  const navigate = useNavigate();
  const [totalStudents] = useState(10);
  const [avgScore] = useState(78);
  const [avgAttendance] = useState(85);

  const performanceData = [
    { subject: "Math", score: 85 },
    { subject: "Physics", score: 78 },
    { subject: "Chem", score: 82 },
    { subject: "English", score: 88 },
  ];

  const trendData = [
    { test: "Test 1", score: 75 },
    { test: "Test 2", score: 82 },
    { test: "Test 3", score: 78 },
    { test: "Test 4", score: 85 },
    { test: "Test 5", score: 83 },
    { test: "Test 6", score: 88 },
    { test: "Test 7", score: 86 },
    { test: "Test 8", score: 90 },
    { test: "Test 9", score: 87 },
    { test: "Test 10", score: 92 },
  ];

  const distributionData = [
    { name: "Grade A", value: 30, color: "#10b981" },
    { name: "Grade B", value: 45, color: "#f59e0b" },
    { name: "Grade C", value: 25, color: "#3b82f6" },
  ];

  const topStudents = [
    { name: "Sneha R", class: "12A", score: 93, attendance: 98 },
    { name: "Priya K", class: "11B", score: 89, attendance: 96 },
    { name: "Neha S", class: "12B", score: 88, attendance: 93 },
    { name: "Aditi S", class: "10A", score: 87, attendance: 93 },
    { name: "Arjun D", class: "11C", score: 81, attendance: 90 },
    { name: "Manish T", class: "10B", score: 79, attendance: 88 },
    { name: "Rahul M", class: "10A", score: 74, attendance: 82 },
    { name: "Leela B", class: "9A", score: 71, attendance: 78 },
    { name: "Karan V", class: "10C", score: 59, attendance: 62 },
    { name: "Vikram P", class: "9C", score: 58, attendance: 68 },
  ];

  const upcomingExams = [
    { title: "Midterm - Class 10A", date: "2025-10-15" },
    { title: "Unit Test - Class 9B", date: "2025-08-28" },
    { title: "Finale - Class 12", date: "2025-12-10" },
  ];

  const attendanceAlerts = [
    { name: "Vikram P (9C)", attendance: "68%" },
    { name: "Karan V (10C)", attendance: "62%" },
  ];

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="glass-panel rounded-2xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <Button
              onClick={() => navigate("/teacher/dashboard")}
              variant="outline"
              size="icon"
              className="glass-panel hover:bg-secondary"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Teacher Analytics Dashboard
              </h1>
              <p className="text-muted-foreground mt-1">
                Class / Section insights & student performance
              </p>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              All Classes
            </Button>
            <Button variant="outline" className="glass-panel hover:bg-secondary">
              All Sections
            </Button>
            <Button variant="outline" className="glass-panel hover:bg-secondary">
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Total Students</p>
            <p className="text-4xl font-bold text-accent">{totalStudents}</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Average Score</p>
            <p className="text-4xl font-bold text-accent">{avgScore}%</p>
          </div>
          <div className="glass-panel rounded-2xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Avg Attendance</p>
            <p className="text-4xl font-bold text-accent">{avgAttendance}%</p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Performance Overview
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="subject" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="score" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Score Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="test" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Grade Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={distributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {distributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tables and Lists */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Top Students */}
          <div className="lg:col-span-2 glass-panel rounded-2xl p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">
              Top 10 Students
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sorted by average score
            </p>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 text-sm text-muted-foreground">
                      Student
                    </th>
                    <th className="text-left py-2 text-sm text-muted-foreground">
                      Class
                    </th>
                    <th className="text-right py-2 text-sm text-muted-foreground">
                      Avg Score
                    </th>
                    <th className="text-right py-2 text-sm text-muted-foreground">
                      Attendance
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topStudents.map((student, index) => (
                    <tr key={index} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{student.name}</td>
                      <td className="py-3 text-muted-foreground">{student.class}</td>
                      <td className="py-3 text-right text-foreground">
                        {student.score}%
                      </td>
                      <td className="py-3 text-right text-muted-foreground">
                        {student.attendance}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Panel */}
          <div className="space-y-4">
            {/* Upcoming Exams */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Upcoming Exams
              </h3>
              <div className="space-y-3">
                {upcomingExams.map((exam, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 glass-input rounded-lg"
                  >
                    <span className="text-sm text-foreground">{exam.title}</span>
                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded-full">
                      {exam.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters Summary */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-2">
                Filters Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                Showing: All Classes
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Last update: 2025-10-17
              </p>
            </div>

            {/* Attendance Alerts */}
            <div className="glass-panel rounded-2xl p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">
                Attendance Alerts
              </h3>
              <p className="text-sm text-muted-foreground mb-3">
                Students below 75% attendance
              </p>
              <ul className="space-y-2">
                {attendanceAlerts.map((alert, index) => (
                  <li key={index} className="text-sm">
                    <span className="text-foreground">• {alert.name}</span>
                    <span className="text-destructive ml-2">— {alert.attendance}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
