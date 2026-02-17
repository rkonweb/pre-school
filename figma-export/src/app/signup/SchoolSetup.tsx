import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Building2 } from "lucide-react";

export function SchoolSetup() {
  const navigate = useNavigate();
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [city, setCity] = useState("");

  const schoolTypes = [
    "Preschool",
    "Kindergarten",
    "Primary School",
    "Secondary School",
    "Play School",
    "Daycare"
  ];

  const handleContinue = () => {
    // Store school info
    sessionStorage.setItem("schoolInfo", JSON.stringify({
      name: schoolName,
      type: schoolType,
      city: city
    }));
    navigate("/signup/loading");
  };

  const handleSkip = () => {
    navigate("/signup/loading");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 shadow-2xl shadow-teal-400/30 mx-auto">
            <Building2 className="h-8 w-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Tell Us About Your School
          </h1>
          <p className="text-slate-300">
            This helps us personalize your experience
          </p>
        </div>

        {/* Form */}
        <div className="space-y-6 bg-slate-800 border border-teal-400/20 rounded-2xl p-8 shadow-xl">
          <div className="space-y-2">
            <Label htmlFor="schoolName" className="text-teal-50 font-medium">
              School Name *
            </Label>
            <Input
              id="schoolName"
              type="text"
              placeholder="Little Chanakyas Preschool"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              className="h-12 text-lg bg-slate-700 border-teal-400/30 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="schoolType" className="text-teal-50 font-medium">
              School Type *
            </Label>
            <select
              id="schoolType"
              value={schoolType}
              onChange={(e) => setSchoolType(e.target.value)}
              className="w-full h-12 px-3 text-lg bg-slate-700 border border-teal-400/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400"
            >
              <option value="">Select school type</option>
              {schoolTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city" className="text-teal-50 font-medium">
              City *
            </Label>
            <Input
              id="city"
              type="text"
              placeholder="Mumbai"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="h-12 text-lg bg-slate-700 border-teal-400/30 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400"
            />
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={handleContinue}
            disabled={!schoolName || !schoolType || !city}
            className="w-full h-12 text-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-900 font-semibold shadow-lg shadow-teal-400/30 disabled:opacity-50"
          >
            Enter Dashboard
          </Button>
          <button
            onClick={handleSkip}
            className="w-full text-slate-400 hover:text-slate-300 font-medium"
          >
            Skip for now
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center gap-2 pt-4">
          <div className="h-2 w-2 rounded-full bg-teal-400"></div>
          <div className="h-2 w-2 rounded-full bg-teal-400"></div>
          <div className="h-2 w-2 rounded-full bg-teal-400"></div>
          <div className="h-2 w-2 rounded-full bg-teal-400"></div>
          <div className="h-2 w-2 rounded-full bg-teal-400"></div>
          <div className="h-2 w-2 rounded-full bg-slate-600"></div>
        </div>
      </div>
    </div>
  );
}
