"use client";



import React, { useState, useEffect, useRef } from "react";

import {  useRouter } from "next/navigation";

import { dataAPI } from "@/lib/api";

import { Button, buttonVariants } from "@/components/ui/button";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Card, CardContent, CardTitle, CardDescription } from "@/components/ui/card";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";

import { toast } from "sonner";

import {

  Check,

  ChevronsUpDown,

  User,

  Phone,

  Mail,

  MapPin,

  Users,

  Layers,

  UploadCloud,

  Camera,

  X,

  CheckCircle2,

  Loader2, Briefcase
} from "lucide-react";

import { cn } from "@/lib/utils";



/* ------------------------------------------------------------------ */

/*  Scoped styles: ambient background + a few action-driven animations */

/* ------------------------------------------------------------------ */

const styles = `

.pf-orb{position:absolute;border-radius:9999px;filter:blur(70px);will-change:transform;

  animation:pf-drift 20s ease-in-out infinite alternate;pointer-events:none}

@keyframes pf-drift{

  0%{transform:translate3d(0,0,0) scale(1)}

  100%{transform:translate3d(8%,10%,0) scale(1.18)}}

.pf-grid{position:absolute;inset:0;pointer-events:none;

  background-image:radial-gradient(circle,rgba(99,102,241,.22) 1px,transparent 1.2px);

  background-size:22px 22px;

  -webkit-mask-image:radial-gradient(ellipse at center,#000 10%,transparent 72%);

          mask-image:radial-gradient(ellipse at center,#000 10%,transparent 72%)}

.dark .pf-grid{background-image:radial-gradient(circle,rgba(165,180,252,.16) 1px,transparent 1.2px)}

.pf-rise{animation:pf-rise .65s cubic-bezier(.2,.8,.2,1) both}

@keyframes pf-rise{from{opacity:0;transform:translateY(16px) scale(.985)}to{opacity:1;transform:none}}

.pf-shake{animation:pf-shake .38s ease-in-out}

@keyframes pf-shake{20%,60%{transform:translateX(-3px)}40%,80%{transform:translateX(3px)}}

.pf-btn{position:relative;overflow:hidden;isolation:isolate}

.pf-btn::after{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;

  background:linear-gradient(110deg,transparent 30%,rgba(255,255,255,.35) 50%,transparent 70%);

  transform:translateX(-120%)}

.pf-btn:hover:not(:disabled)::after{transform:translateX(120%);transition:transform .8s ease}

@media (prefers-reduced-motion:reduce){

  .pf-orb,.pf-rise,.pf-shake{animation:none!important}

  .pf-btn::after{transition:none!important}}

`;



const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isTenDigits = (v) => /^\d{10}$/.test(String(v).replace(/\D/g, ""));



/* ------------------------------------------------------------------ */

/*  Reusable text field (icon on the left, live "valid" tick on right) */

/* ------------------------------------------------------------------ */

function Field({ id, label, icon: Icon, error, valid, className, ...inputProps }) {

  return (

    <div className={cn("space-y-1.5", className)}>

      <Label htmlFor={id} className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">

        {label} <span className="text-rose-500" aria-hidden="true">*</span>

      </Label>

      <div className="group relative">

        {Icon && (

          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 transition-colors group-focus-within:text-indigo-500" />

        )}

        <Input

          id={id}

          name={id}

          aria-invalid={!!error}

          aria-describedby={error ? `${id}-error` : undefined}

          className={cn(

            "h-10 border-zinc-200 bg-white/70 pr-9 text-base transition-all sm:h-9 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950/40",

            Icon ? "pl-9" : "pl-3",

            error

              ? "pf-shake border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/30"

              : "focus-visible:border-indigo-500 focus-visible:ring-indigo-500/30",

            valid && !error && "border-emerald-500/50"

          )}

          {...inputProps}

        />

        {valid && !error && (

          <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-500 animate-in zoom-in duration-200" />

        )}

      </div>

      {error && (

        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-rose-500 animate-in fade-in slide-in-from-top-1">

          {error}

        </p>

      )}

    </div>

  );

}



/* ------------------------------------------------------------------ */

/*  Reusable searchable select (Popover + Command)                     */

/* ------------------------------------------------------------------ */

function Combo({

  id,

  label,

  icon: Icon,

  open,

  onOpenChange,

  options,

  value,

  onSelect,

  placeholder,

  searchPlaceholder,

  emptyText,

  disabled,

}) {

  const selected = options.find((o) => String(o.id) === String(value));

  return (

    <div className="space-y-1.5">

      <Label htmlFor={id} className="text-[13px] font-medium text-zinc-700 dark:text-zinc-300">

        {label}

      </Label>

      <Popover open={open} onOpenChange={onOpenChange}>

        <PopoverTrigger

          id={id}

          className={cn(

            buttonVariants({ variant: "outline" }),

            "h-10 w-full justify-between gap-2 border-zinc-200 bg-white/70 px-3 text-left text-base font-normal transition-all sm:h-9 sm:text-sm dark:border-zinc-800 dark:bg-zinc-950/40",

            "focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-indigo-500/30",

            disabled && "cursor-not-allowed opacity-60"

          )}

          role="combobox"

          aria-expanded={open}

          disabled={disabled}

        >

          <span className="flex min-w-0 items-center gap-2">

            <Icon className="h-4 w-4 shrink-0 text-zinc-400" />

            <span className={cn("truncate", !selected && "text-zinc-500")}>

              {selected ? selected.name : placeholder}

            </span>

          </span>

          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />

        </PopoverTrigger>

        <PopoverContent className="w-[min(20rem,calc(100vw-2rem))] p-0" align="start">

          <Command>

            <CommandInput placeholder={searchPlaceholder} />

            <CommandList>

              <CommandEmpty>{emptyText}</CommandEmpty>

              <CommandGroup>

                {options.map((o) => (

                  <CommandItem

                    key={o.id}

                    value={o.name}

                    onSelect={() => {

                      onSelect(String(o.id));

                      onOpenChange(false);

                    }}

                  >

                    <Check

                      className={cn(

                        "mr-2 h-4 w-4 text-indigo-500",

                        String(value) === String(o.id) ? "opacity-100" : "opacity-0"

                      )}

                    />

                    {o.name}

                  </CommandItem>

                ))}

              </CommandGroup>

            </CommandList>

          </Command>

        </PopoverContent>

      </Popover>

    </div>

  );

}



/* ------------------------------------------------------------------ */

/*  Main component                                                     */

/* ------------------------------------------------------------------ */

export default function PersonForm({ initialData }) {

  const router = useRouter();

  const fileInputRef = useRef(null);



  const [loading, setLoading] = useState(false);

  const [teams, setTeams] = useState([]);

  const [teamTypes, setTeamTypes] = useState([]);



  const [formData, setFormData] = useState({
    designation: initialData?.designation || "",

    name: initialData?.name || "",

    phone: initialData?.phone || "",

    email: initialData?.email || "",

    address: initialData?.address || "",

    team: initialData?.team || "",

    team_type: initialData?.team_type || "",
    state: initialData?.state || "",
    district: initialData?.district || "",
    constituency: initialData?.constituency || "",
    mandal: initialData?.mandal || "",

    photo: null,

  });



  const [errors, setErrors] = useState({});

  const [statesList, setStatesList] = useState([]);
  const [districtsList, setDistrictsList] = useState([]);
  const [constituenciesList, setConstituenciesList] = useState([]);
  const [mandalsList, setMandalsList] = useState([]);

  const [openState, setOpenState] = useState(false);
  const [openDistrict, setOpenDistrict] = useState(false);
  const [openConstituency, setOpenConstituency] = useState(false);
  const [openMandal, setOpenMandal] = useState(false);

  const [openTeamType, setOpenTeamType] = useState(false);

  const [openTeam, setOpenTeam] = useState(false);

  const [isDragging, setIsDragging] = useState(false);



  const [previewUrl, setPreviewUrl] = useState(

    initialData?.photo && typeof initialData.photo === "string" ? initialData.photo : null

  );



  useEffect(() => {

    dataAPI.getTeamTypes().then(res => setTeamTypes((res || []).filter(t => t.is_active !== false))).catch(console.error);

    dataAPI

      .getTeams()

      .then((res) => {

        setTeams((res || []).filter(t => t.is_active !== false));

        // If editing an existing person, infer their team_type from their team

        if (initialData?.team) {

          const foundTeam = res.find((t) => String(t.id) === String(initialData.team));

          if (foundTeam) {

            setFormData((prev) => ({ ...prev, team_type: String(foundTeam.type) }));

          }

        }

      })

      .catch(console.error);

  }, [initialData]);




  useEffect(() => {
    dataAPI.getStates().then(res => setStatesList((res || []).filter(s => s.is_active)));
  }, []);

  useEffect(() => {
    if (formData.state) {
      dataAPI.getDistricts(formData.state).then(res => setDistrictsList(res.filter(r => r.is_active)));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDistrictsList([]);
    }
  }, [formData.state]);

  useEffect(() => {
    if (formData.district) {
      dataAPI.getConstituencies(formData.district).then(res => setConstituenciesList(res.filter(r => r.is_active)));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setConstituenciesList([]);
    }
  }, [formData.district]);

  useEffect(() => {
    if (formData.district && formData.constituency) {
      dataAPI.getMandals(formData.district, formData.constituency).then(res => setMandalsList(res.filter(r => r.is_active)));
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMandalsList([]);
    }
  }, [formData.district, formData.constituency]);

  // Cleanup object URL on unmount or previewUrl change to avoid memory leaks

  useEffect(() => {

    return () => {

      if (previewUrl && previewUrl.startsWith("blob:")) {

        URL.revokeObjectURL(previewUrl);

      }

    };

  }, [previewUrl]);



  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));

  };



  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      
      if (name === "team_type") {
        next.state = ""; next.district = ""; next.constituency = ""; next.mandal = ""; next.team = "";
      } else if (name === "state") {
        next.district = ""; next.constituency = ""; next.mandal = ""; next.team = "";
      } else if (name === "district") {
        next.constituency = ""; next.mandal = ""; next.team = "";
      } else if (name === "constituency") {
        next.mandal = ""; next.team = "";
      } else if (name === "mandal") {
        next.team = "";
      }
      
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };



  const processFile = (file) => {

    if (file && file.type.startsWith("image/")) {

      setFormData((prev) => ({ ...prev, photo: file }));

      setPreviewUrl(URL.createObjectURL(file));

      if (errors.photo) setErrors((prev) => ({ ...prev, photo: null }));

    } else if (file) {

      toast.error("Please select a valid image file.");

    }

  };



  const handleFileChange = (e) => {

    if (e.target.files && e.target.files[0]) {

      processFile(e.target.files[0]);

    }

    // allow choosing the same file again after removing it

    e.target.value = "";

  };



  const handleDragOver = (e) => {

    e.preventDefault();

    setIsDragging(true);

  };



  const handleDragLeave = (e) => {

    e.preventDefault();

    // ignore leave events fired when moving between child elements

    if (e.currentTarget.contains(e.relatedTarget)) return;

    setIsDragging(false);

  };



  const handleDrop = (e) => {

    e.preventDefault();

    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {

      processFile(e.dataTransfer.files[0]);

    }

  };



  const clearPhoto = (e) => {

    e.preventDefault();

    e.stopPropagation();

    setFormData((prev) => ({ ...prev, photo: null }));

    setPreviewUrl(null);

    if (fileInputRef.current) fileInputRef.current.value = "";

  };



  const validate = () => {

    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required.";

    else if (formData.name.length < 3) newErrors.name = "Name must be at least 3 characters.";

    if (!formData.designation?.trim()) newErrors.designation = "Designation is required.";



    if (!formData.phone.trim()) {

      newErrors.phone = "Phone is required.";

    } else if (!isTenDigits(formData.phone)) {

      newErrors.phone = "Phone must be a valid 10-digit number.";

    }



    if (!formData.email.trim()) {

      newErrors.email = "Email is required.";

    } else if (!EMAIL_RE.test(formData.email)) {

      newErrors.email = "Please enter a valid email address.";

    }



    if (!formData.address.trim()) {

      newErrors.address = "Address is required.";

    }



    setErrors(newErrors);



    // move focus to the first invalid field

    const firstInvalid = Object.keys(newErrors)[0];

    if (firstInvalid) {

      requestAnimationFrame(() => document.getElementById(firstInvalid)?.focus());

    }

    return Object.keys(newErrors).length === 0;

  };



  const handleSubmit = async (e, addAnother = false) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the errors before submitting.");
      return;
    }

    if (filteredTeams.length !== 1) {
      toast.error("Team not found for this hierarchy. Please ensure the team exists.");
      return;
    }
    const finalData = { ...formData, team: filteredTeams[0].id };


    setLoading(true);
    try {
      if (initialData?.id) {
        await dataAPI.updatePerson(initialData.id, finalData);
        toast.success("Person updated successfully");
        router.push("/persons");
        router.refresh();
      } else {
        await dataAPI.createPerson(finalData);
        toast.success("Person created successfully");
        if (addAnother) {
          // Reset only person details, keep geography
          setFormData(prev => ({
            ...prev,
            name: "",
            designation: "",
            phone: "",
            email: "",
            address: "",
            photo: null
          }));
          setPreviewUrl("");
        } else {
          router.push("/persons");
          router.refresh();
        }
      }
    }
    catch (error) {

      console.error(error);

      const detail = error?.response?.data;

      if (detail && typeof detail === "object") {

        const errorMsg = Object.entries(detail)

          .map(([k, v]) => `${k}: ${v}`)

          .join(", ");

        toast.error(`Validation error: ${errorMsg}`);

      } else {

        toast.error("An error occurred while saving.");

      }

    } finally {

      setLoading(false);

    }

  };



  const filteredTeams = teams.filter((t) => {
    if (formData.team_type && String(t.type) !== String(formData.team_type)) return false;
    if (formData.state && String(t.state) !== String(formData.state)) return false;
    if (formData.district && String(t.district) !== String(formData.district)) return false;
    if (formData.constituency && String(t.constituency) !== String(formData.constituency)) return false;
    if (formData.mandal && String(t.mandal) !== String(formData.mandal)) return false;
    return true;
  });



  // Inline validation states

  const isNameValid = formData.name.trim().length >= 3;

  const isPhoneValid = Boolean(formData.phone) && isTenDigits(formData.phone);

  const isEmailValid = Boolean(formData.email) && EMAIL_RE.test(formData.email);

  const isAddressValid = formData.address.trim().length > 0;



  const photoHint =

    formData.photo instanceof File ? formData.photo.name : previewUrl ? "Current photo" : "JPG, PNG or WEBP";



  return (

    <>

      <style>{styles}</style>



      {/* Stage: self-contained, clips its own background so it fits any layout */}

     <div className="relative isolate mx-auto w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-blue-200/70 bg-linear-to-br from-blue-50 via-blue to-cyan-60 p-3 sm:p-6 dark:border-white/10 dark:from-slate-950 dark:via-slate-950 dark:to-blue-950">

        {/* Ambient background */}

        <div aria-hidden="true" className="absolute inset-0 -z-10">

          <div className="pf-grid" />

          <div className="pf-orb -left-16 -top-20 h-64 w-64 bg-indigo-400/40 dark:bg-indigo-600/25" />

          <div

            className="pf-orb -bottom-24 -right-16 h-72 w-72 bg-cyan-300/50 dark:bg-cyan-500/15"

            style={{ animationDelay: "-7s", animationDuration: "24s" }}

          />

          <div

            className="pf-orb left-1/3 top-1/2 h-48 w-48 bg-fuchsia-300/30 dark:bg-fuchsia-600/15"

            style={{ animationDelay: "-12s", animationDuration: "28s" }}

          />

        </div>



        <Card className="pf-rise relative gap-0 overflow-hidden rounded-2xl border border-white/70 bg-white/70 py-0 shadow-[0_18px_50px_-18px_rgba(79,70,229,0.35)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/60">

          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-indigo-400/70 to-transparent" />



          <form onSubmit={(e) => handleSubmit(e, false)} noValidate>

            {/* Header: avatar uploader + title (whole header accepts dropped images) */}

            <div

              className={cn(

                "flex items-center gap-4 border-b border-zinc-200/70 p-4 transition-colors sm:p-6 dark:border-white/10",

                isDragging && "bg-indigo-50/80 dark:bg-indigo-950/30"

              )}

              onDragOver={handleDragOver}

              onDragLeave={handleDragLeave}

              onDrop={handleDrop}

            >

              <div className="relative shrink-0">

                <div

                  role="button"

                  tabIndex={0}

                  aria-label={previewUrl ? "Change profile photo" : "Upload profile photo"}

                  onClick={() => fileInputRef.current?.click()}

                  onKeyDown={(e) => {

                    if (e.key === "Enter" || e.key === " ") {

                      e.preventDefault();

                      fileInputRef.current?.click();

                    }

                  }}

                  className={cn(

                    "group relative flex h-18 w-18 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 outline-none transition-all duration-200 sm:h-20 sm:w-20",

                    "focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-zinc-900",

                    previewUrl

                      ? "border-white shadow-lg dark:border-zinc-700"

                      : "border-dashed border-zinc-300 bg-white/60 hover:border-indigo-400 dark:border-zinc-700 dark:bg-zinc-900/50",

                    isDragging && "scale-105 border-indigo-500"

                  )}

                >

                  {previewUrl ? (

                    <>

                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Profile preview" className="h-full w-full object-cover" />

                      <span className="absolute inset-0 flex items-center justify-center bg-black/45 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">

                        <Camera className="h-5 w-5 text-white" />

                      </span>

                    </>

                  ) : (

                    <UploadCloud

                      className={cn(

                        "h-6 w-6 text-indigo-500 transition-transform group-hover:-translate-y-0.5",

                        isDragging && "-translate-y-1"

                      )}

                    />

                  )}

                </div>



                {previewUrl && (

                  <button

                    type="button"

                    onClick={clearPhoto}

                    aria-label="Remove photo"

                    className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white shadow-md transition-transform hover:scale-110 hover:bg-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-rose-500 dark:hover:text-white animate-in zoom-in duration-200"

                  >

                    <X className="h-3.5 w-3.5" />

                  </button>

                )}



                <input

                  ref={fileInputRef}

                  id="photo"

                  name="photo"

                  type="file"

                  accept="image/*"

                  onChange={handleFileChange}

                  className="hidden"

                />

              </div>



              <div className="min-w-0 flex-1">

                <CardTitle className="text-lg font-semibold leading-tight tracking-tight text-zinc-900 sm:text-xl dark:text-zinc-100">

                  {initialData ? "Edit Person Profile" : "Register New Person"}

                </CardTitle>

                <CardDescription className="mt-1 text-xs leading-snug text-zinc-500 sm:text-sm">

                  {initialData

                    ? "Update the details and team assignments for this person."

                    : "Fill out the form below to register a new person into the system."}

                </CardDescription>

                <p className="mt-1.5 truncate text-xs text-zinc-400" title={photoHint}>

                  {isDragging ? "Drop image to upload" : photoHint}

                </p>

              </div>

            </div>



            <CardContent className="p-4 sm:p-6">

              <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">

                <Field

                  id="name"

                  label="Full Name"

                  icon={User}

                  value={formData.name}

                  onChange={handleChange}

                  error={errors.name}

                  valid={isNameValid}

                  placeholder="e.g. John Doe"

                  autoComplete="name"

                />
                <Field
                  id="designation"
                  label="Designation *"
                  icon={Briefcase}
                  value={formData.designation}
                  onChange={handleChange}
                  placeholder="e.g. President, Secretary"
                  error={errors.designation}
                  valid={Boolean(formData.designation)}
                />

                <Field

                  id="phone"

                  label="Phone Number"

                  icon={Phone}

                  type="tel"

                  inputMode="tel"

                  value={formData.phone}

                  onChange={handleChange}

                  error={errors.phone}

                  valid={isPhoneValid}

                  placeholder="10-digit mobile number"

                  autoComplete="tel"

                />

                <Field

                  id="email"

                  label="Email Address"

                  icon={Mail}

                  type="email"

                  value={formData.email}

                  onChange={handleChange}

                  error={errors.email}

                  valid={isEmailValid}

                  placeholder="e.g. john@example.com"

                  autoComplete="email"

                />

                <Field

                  id="address"

                  label="Physical Address"

                  icon={MapPin}

                  value={formData.address}

                  onChange={handleChange}

                  error={errors.address}

                  valid={isAddressValid}

                  placeholder="Full residential address"

                  autoComplete="street-address"

                />



                {/* Team assignment */}

                <div className="flex items-center gap-3 pt-1 sm:col-span-2">

                  <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Team assignment</span>

                  <span className="h-px flex-1 bg-linear-to-r from-zinc-200 to-transparent dark:from-zinc-800" />

                </div>



                <Combo

                  id="team_type"

                  label="Team Type"

                  icon={Layers}

                  open={openTeamType}

                  onOpenChange={setOpenTeamType}

                  options={teamTypes}

                  value={formData.team_type}

                  onSelect={(v) => handleSelectChange("team_type", v)}

                  placeholder="Select team type..."

                  searchPlaceholder="Search team type..."

                  emptyText="No team type found."

                />
                  
{(() => {
                    const selectedTeamType = teamTypes.find(tt => String(tt.id) === String(formData.team_type));
                    const currentLevel = selectedTeamType ? selectedTeamType.level : 0;
                    
                    const isFullySelected = 
                      formData.team_type &&
                      (currentLevel <= 1 || formData.state) &&
                      (currentLevel <= 2 || formData.district) &&
                      (currentLevel <= 3 || formData.constituency) &&
                      (currentLevel <= 4 || formData.mandal);

                    return (
                      <>
                        {currentLevel >= 1 && (
                          <Combo
                            id="state"
                            label="State"
                            icon={MapPin}
                            open={openState}
                            onOpenChange={setOpenState}
                            options={statesList}
                            value={formData.state}
                            onSelect={(v) => handleSelectChange("state", v)}
                            placeholder="Select state..."
                            searchPlaceholder="Search state..."
                            emptyText="No state found."
                          />
                        )}
                        {currentLevel >= 2 && (
                          <Combo
                            id="district"
                            label="District"
                            icon={MapPin}
                            open={openDistrict}
                            onOpenChange={setOpenDistrict}
                            options={districtsList}
                            value={formData.district}
                            onSelect={(v) => handleSelectChange("district", v)}
                            placeholder={formData.state ? "Select district..." : "Select state first"}
                            searchPlaceholder="Search district..."
                            emptyText="No district found."
                            disabled={!formData.state}
                          />
                        )}
                        {currentLevel >= 3 && (
                          <Combo
                            id="constituency"
                            label="Constituency"
                            icon={MapPin}
                            open={openConstituency}
                            onOpenChange={setOpenConstituency}
                            options={constituenciesList}
                            value={formData.constituency}
                            onSelect={(v) => handleSelectChange("constituency", v)}
                            placeholder={formData.district ? "Select constituency..." : "Select district first"}
                            searchPlaceholder="Search constituency..."
                            emptyText="No constituency found."
                            disabled={!formData.district}
                          />
                        )}
                        {currentLevel >= 4 && (
                          <Combo
                            id="mandal"
                            label="Mandal"
                            icon={MapPin}
                            open={openMandal}
                            onOpenChange={setOpenMandal}
                            options={mandalsList}
                            value={formData.mandal}
                            onSelect={(v) => handleSelectChange("mandal", v)}
                            placeholder={formData.constituency ? "Select mandal..." : "Select constituency first"}
                            searchPlaceholder="Search mandal..."
                            emptyText="No mandal found."
                            disabled={!formData.constituency}
                          />
                        )}
                      </>
                    );
                  })()}

              </div>

            </CardContent>



            {/* Footer */}

            <div className="flex flex-col-reverse items-stretch gap-3 border-t border-zinc-200/70 bg-zinc-50/60 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:border-white/10 dark:bg-zinc-950/30">

              <p className="text-center text-xs text-zinc-500 sm:text-left">

                Fields marked with <span className="font-bold text-rose-500">*</span> are required.

              </p>

              <div className="flex gap-2.5">

                <Button

                  type="button"

                  variant="outline"

                  onClick={() => router.back()}

                  disabled={loading}

                  className="h-10 flex-1 bg-white/70 sm:h-9 sm:flex-none dark:bg-transparent"

                >

                  Cancel

                </Button>

                <Button

                  type="submit"

                  disabled={loading}

                  className="pf-btn h-10 flex-1 bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition-all hover:shadow-lg hover:shadow-indigo-500/30 active:scale-[0.98] sm:h-9 sm:w-37.5 sm:flex-none"

                >

                  {loading ? (

                    <span className="flex items-center gap-2">

                      <Loader2 className="h-4 w-4 animate-spin" />

                      Saving...

                    </span>

                  ) : initialData ? (

                    "Save Changes"

                  ) : (

                    "Create Person"

                  )}

                </Button>

              </div>

            </div>

          </form>

        </Card>

      </div>

    </>

  );

}



