import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, Loader2 } from "lucide-react";
import { getMasterDataAction } from "@/app/actions/master-data-actions";
import { updateSignupStepAction } from "@/app/actions/auth-actions";

export function SchoolSetup() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [schoolType, setSchoolType] = useState("");
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<{ id: string; name: string }[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);

  useEffect(() => {
    async function fetchCities() {
      const res = await getMasterDataAction("CITY");
      if (res.success && res.data) {
        setCities(res.data);
      }
      setLoadingCities(false);
    }
    fetchCities();
  }, []);

  const schoolTypes = [
    "Preschool",
    "Kindergarten",
    "Primary School",
    "Secondary School",
    "Play School",
    "Daycare"
  ];

  const handleContinue = async () => {
    // Store school info
    sessionStorage.setItem("schoolInfo", JSON.stringify({
      firstName,
      lastName,
      name: schoolName,
      type: schoolType,
      city: city
    }));

    // Track step progress server-side
    const phone = sessionStorage.getItem("phoneNumber");
    if (phone) {
      await updateSignupStepAction(phone, "LOADING");
    }

    router.push("/signup/loading");
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4" suppressHydrationWarning={true}>
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
        <div className="space-y-6 bg-slate-800 border border-teal-400/20 rounded-2xl p-8 shadow-xl" suppressHydrationWarning={true}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-teal-50 font-medium">
                First Name *
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Aryan"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="h-12 bg-slate-700 border-teal-400/30 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-teal-50 font-medium">
                Last Name *
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Sharma"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="h-12 bg-slate-700 border-teal-400/30 text-white placeholder:text-slate-500 focus:border-teal-400 focus:ring-teal-400"
              />
            </div>
          </div>

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
            <div className="relative">
              <select
                id="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                disabled={loadingCities}
                className="w-full h-12 px-3 text-lg bg-slate-700 border border-teal-400/30 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 appearance-none disabled:opacity-50"
              >
                <option value="">{loadingCities ? "Loading cities..." : "Select city"}</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {loadingCities && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 animate-spin text-teal-400" />
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={handleContinue}
            disabled={!firstName || !lastName || !schoolName || !schoolType || !city}
            className="w-full h-12 text-lg bg-gradient-to-r from-teal-400 to-cyan-500 hover:from-teal-500 hover:to-cyan-600 text-slate-900 font-semibold shadow-lg shadow-teal-400/30 disabled:opacity-50"
          >
            Enter Dashboard
          </Button>

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
