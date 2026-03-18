"use client";
import { useState, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import {
  getCalendarSettingsAction, updateSchoolTimingsAction,
  addHolidayAction, updateHolidayAction, deleteHolidayAction,
  saveCalendarNoteAction, deleteCalendarNoteAction, bulkAddHolidaysAction,
  toggleDayStatusAction, bulkToggleDayOfWeekAction,
} from "@/app/actions/calendar-actions";
import { getAcademicYearsAction } from "@/app/actions/academic-year-actions";
import { getCookie } from "@/lib/cookies";
import {
  Calendar, Clock, Plus, Trash2, Check, Loader2, CalendarDays,
  Star, ChevronLeft, ChevronRight, Sparkles, X, Bell, BellOff,
  ToggleLeft, ToggleRight, AlertCircle,
} from "lucide-react";

const HOLIDAY_TYPES = [
  { value: "HOLIDAY", label: "Public Holiday", color: "#EF4444", bg: "#FEE2E2" },
  { value: "RESTRICTED", label: "Restricted Holiday", color: "#F59E0B", bg: "#FEF3C7" },
  { value: "EVENT", label: "School Event", color: "#6366F1", bg: "#EDE9FE" },
];
const MN = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function getHolidaysSuggestions(year: number) {
  return [
    { name: "New Year's Day", date: `${year}-01-01`, type: "RESTRICTED" },
    { name: "Makar Sankranti / Pongal / Uttarayan", date: `${year}-01-14`, type: "HOLIDAY" },
    { name: "Subhas Chandra Bose Jayanti", date: `${year}-01-23`, type: "RESTRICTED" },
    { name: "Republic Day", date: `${year}-01-26`, type: "HOLIDAY" },
    { name: "Basant Panchami / Saraswati Puja", date: `${year}-02-02`, type: "RESTRICTED" },
    { name: "Guru Ravidas Jayanti", date: `${year}-02-12`, type: "RESTRICTED" },
    { name: "Shivaji Jayanti", date: `${year}-02-19`, type: "RESTRICTED" },
    { name: "Maha Shivaratri", date: `${year}-02-26`, type: "HOLIDAY" },
    { name: "Holika Dahan", date: `${year}-03-13`, type: "RESTRICTED" },
    { name: "Holi", date: `${year}-03-14`, type: "HOLIDAY" },
    { name: "Ugadi / Gudi Padwa", date: `${year}-03-30`, type: "RESTRICTED" },
    { name: "Good Friday", date: `${year}-03-29`, type: "HOLIDAY" },
    { name: "Easter Sunday", date: `${year}-03-31`, type: "RESTRICTED" },
    { name: "Ram Navami", date: `${year}-04-06`, type: "HOLIDAY" },
    { name: "Mahavir Jayanti", date: `${year}-04-10`, type: "HOLIDAY" },
    { name: "Dr. B.R. Ambedkar Jayanti", date: `${year}-04-14`, type: "HOLIDAY" },
    { name: "May Day / Labour Day", date: `${year}-05-01`, type: "HOLIDAY" },
    { name: "Buddha Purnima / Vesak", date: `${year}-05-12`, type: "HOLIDAY" },
    { name: "Eid ul-Fitr (Tentative)", date: `${year}-03-31`, type: "HOLIDAY" },
    { name: "Eid ul-Adha / Bakrid (Tentative)", date: `${year}-06-07`, type: "HOLIDAY" },
    { name: "Rath Yatra", date: `${year}-06-29`, type: "RESTRICTED" },
    { name: "Muharram (Tentative)", date: `${year}-06-27`, type: "HOLIDAY" },
    { name: "Independence Day", date: `${year}-08-15`, type: "HOLIDAY" },
    { name: "Raksha Bandhan", date: `${year}-08-09`, type: "HOLIDAY" },
    { name: "Janmashtami", date: `${year}-08-16`, type: "HOLIDAY" },
    { name: "Parsi New Year", date: `${year}-08-17`, type: "RESTRICTED" },
    { name: "Milad un-Nabi (Tentative)", date: `${year}-09-05`, type: "HOLIDAY" },
    { name: "Onam", date: `${year}-09-05`, type: "RESTRICTED" },
    { name: "Ganesh Chaturthi", date: `${year}-09-07`, type: "HOLIDAY" },
    { name: "Mahatma Gandhi Jayanti", date: `${year}-10-02`, type: "HOLIDAY" },
    { name: "Navratri Begins", date: `${year}-10-03`, type: "RESTRICTED" },
    { name: "Dussehra / Vijayadashami", date: `${year}-10-12`, type: "HOLIDAY" },
    { name: "Karva Chauth", date: `${year}-10-17`, type: "RESTRICTED" },
    { name: "Dhanteras", date: `${year}-10-20`, type: "RESTRICTED" },
    { name: "Diwali / Deepavali", date: `${year}-10-21`, type: "HOLIDAY" },
    { name: "Govardhan Puja", date: `${year}-10-22`, type: "RESTRICTED" },
    { name: "Bhai Dooj", date: `${year}-10-23`, type: "RESTRICTED" },
    { name: "Chhath Puja", date: `${year}-10-26`, type: "RESTRICTED" },
    { name: "Guru Nanak Jayanti", date: `${year}-11-05`, type: "HOLIDAY" },
    { name: "Christmas", date: `${year}-12-25`, type: "HOLIDAY" },
    { name: "World Hindi Day", date: `${year}-01-10`, type: "EVENT" },
    { name: "National Youth Day", date: `${year}-01-12`, type: "EVENT" },
    { name: "Valentine's Day", date: `${year}-02-14`, type: "EVENT" },
    { name: "International Women's Day", date: `${year}-03-08`, type: "EVENT" },
    { name: "Earth Day", date: `${year}-04-22`, type: "EVENT" },
    { name: "World Book Day", date: `${year}-04-23`, type: "EVENT" },
    { name: "World Environment Day", date: `${year}-06-05`, type: "EVENT" },
    { name: "International Yoga Day", date: `${year}-06-21`, type: "EVENT" },
    { name: "Kargil Vijay Diwas", date: `${year}-07-26`, type: "EVENT" },
    { name: "National Sports Day", date: `${year}-08-29`, type: "EVENT" },
    { name: "Teacher's Day", date: `${year}-09-05`, type: "EVENT" },
    { name: "Hindi Diwas", date: `${year}-09-14`, type: "EVENT" },
    { name: "Children's Day", date: `${year}-11-14`, type: "EVENT" },
    { name: "Constitution Day", date: `${year}-11-26`, type: "EVENT" },
    { name: "Human Rights Day", date: `${year}-12-10`, type: "EVENT" },
    { name: "Annual Day (Suggested)", date: `${year}-02-15`, type: "EVENT" },
    { name: "Sports Day (Suggested)", date: `${year}-12-19`, type: "EVENT" },
    { name: "Science Exhibition (Suggested)", date: `${year}-02-28`, type: "EVENT" },
    { name: "Graduation Day (Suggested)", date: `${year}-03-25`, type: "EVENT" },
    { name: "Summer Vacation Start", date: `${year}-05-01`, type: "EVENT" },
    { name: "Summer Vacation End", date: `${year}-06-15`, type: "EVENT" },
    { name: "Winter Break Start", date: `${year}-12-24`, type: "EVENT" },
    { name: "Winter Break End", date: `${year}-01-02`, type: "EVENT" },
  ];
}

// Status colors
const STATUS_COLORS: Record<string,{bg:string;color:string;label:string;border1:string;border2:string}> = {
  WORKING: { bg: "white", color: "#059669", label: "Working", border1: "#34D399", border2: "#059669" },
  HALFDAY: { bg: "white", color: "#D97706", label: "Half Day", border1: "#FCD34D", border2: "#F59E0B" },
  HOLIDAY: { bg: "white", color: "#DC2626", label: "Holiday", border1: "#FCA5A5", border2: "#EF4444" },
};
const STATUS_CYCLE = ["WORKING", "HALFDAY", "HOLIDAY"];

export default function SchoolCalendarPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string|null>(null);
  const [timings, setTimings] = useState("9:00 AM - 3:00 PM");
  const [workingDays, setWorkingDays] = useState<string[]>(["MON","TUE","WED","THU","FRI"]);
  const [holidays, setHolidays] = useState<any[]>([]);
  const [calendarNotes, setCalendarNotes] = useState<any[]>([]);
  const [dayStatuses, setDayStatuses] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newHoliday, setNewHoliday] = useState({name:"",date:"",type:"HOLIDAY",recurring:false});
  const [toast, setToast] = useState<{msg:string;ok:boolean}|null>(null);
  const [academicStartMonth, setAcademicStartMonth] = useState(4);
  const [academicYearStart, setAcademicYearStart] = useState(()=>{const n=new Date();return n.getMonth()>=3?n.getFullYear():n.getFullYear()-1;});
  const [showAISuggest, setShowAISuggest] = useState(false);
  const [aiSelected, setAiSelected] = useState<Set<number>>(new Set());
  // Note modal
  const [selectedDate, setSelectedDate] = useState<{date:string;month:number;year:number;day:number}|null>(null);
  const [editingNoteId, setEditingNoteId] = useState<string|null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteText, setNoteText] = useState("");
  const [noteReminder, setNoteReminder] = useState(false);
  const [noteReminderDays, setNoteReminderDays] = useState(1);
  const [noteReminderType, setNoteReminderType] = useState("NOTIFICATION");
  const [noteColor, setNoteColor] = useState("#6366F1");

  const showToast=(msg:string,ok:boolean)=>{setToast({msg,ok});setTimeout(()=>setToast(null),3000);};

  const load = useCallback(async()=>{
    setLoading(true);
    const res = await getCalendarSettingsAction(slug);
    if(res.success&&res.data){
      setTimings(res.data.schoolTimings);
      try{const wd=JSON.parse(res.data.workingDays);if(Array.isArray(wd))setWorkingDays(wd);}catch{}
      setHolidays(res.data.holidays||[]);
      setCalendarNotes(res.data.notes||[]);
      setDayStatuses(res.data.dayStatuses||[]);
      const sm=res.data.academicYearStartMonth||4;
      setAcademicStartMonth(sm);
      // Sync with global header academic year cookie
      const cookieYearId=getCookie(`academic_year_${slug}`);
      if(cookieYearId){
        try{
          const ayRes=await getAcademicYearsAction(slug);
          if(ayRes.success&&ayRes.data){
            const selectedAy=ayRes.data.find((y:any)=>y.id===cookieYearId);
            if(selectedAy&&selectedAy.startDate){
              const sd=new Date(selectedAy.startDate);
              setAcademicYearStart(sd.getFullYear());
            } else {
              const n=new Date();setAcademicYearStart(n.getMonth()+1>=sm?n.getFullYear():n.getFullYear()-1);
            }
          } else {
            const n=new Date();setAcademicYearStart(n.getMonth()+1>=sm?n.getFullYear():n.getFullYear()-1);
          }
        }catch{
          const n=new Date();setAcademicYearStart(n.getMonth()+1>=sm?n.getFullYear():n.getFullYear()-1);
        }
      } else {
        const n=new Date();setAcademicYearStart(n.getMonth()+1>=sm?n.getFullYear():n.getFullYear()-1);
      }
    }
    setLoading(false);
  },[slug]);
  useEffect(()=>{load();},[load]);

  const holidayMap = useMemo(()=>{const m:Record<string,any>={};for(const h of holidays){const d=new Date(h.date);m[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`]=h;}return m;},[holidays]);
  const noteMap = useMemo(()=>{const m:Record<string,any[]>={};for(const n of calendarNotes){const d=new Date(n.date);const k=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;if(!m[k])m[k]=[];m[k].push(n);}return m;},[calendarNotes]);
  const statusMap = useMemo(()=>{const m:Record<string,string>={};for(const s of dayStatuses){const d=new Date(s.date);m[`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`]=s.status;}return m;},[dayStatuses]);

  const saveTimings=async()=>{setSaving("timings");const r=await updateSchoolTimingsAction(slug,timings);showToast(r.success?"Timings updated!":r.error||"Failed",r.success);setSaving(null);};
  const handleAddHoliday=async()=>{if(!newHoliday.name||!newHoliday.date)return showToast("Name and date required",false);setSaving("holiday");const r=await addHolidayAction(slug,newHoliday);if(r.success){showToast("Holiday added!",true);setNewHoliday({name:"",date:"",type:"HOLIDAY",recurring:false});setShowAddForm(false);load();}else showToast(r.error||"Failed",false);setSaving(null);};
  const handleDeleteHoliday=async(id:string)=>{setSaving(`del-${id}`);const r=await deleteHolidayAction(slug,id);if(r.success){setHolidays(h=>h.filter((x:any)=>x.id!==id));showToast("Deleted",true);}setSaving(null);};
  const handleToggleHoliday=async(id:string,current:boolean)=>{setSaving(`tog-${id}`);const r=await updateHolidayAction(slug,id,{isHoliday:!current});if(r.success){setHolidays(h=>h.map((x:any)=>x.id===id?{...x,isHoliday:!current}:x));showToast(!current?"Marked as holiday":"Marked as working day",true);}setSaving(null);};

  // Toggle day status: click cycles WORKING -> HALFDAY -> HOLIDAY -> WORKING
  const handleDayStatusToggle=async(dateKey:string)=>{
    const current=statusMap[dateKey]||"WORKING";
    const idx=STATUS_CYCLE.indexOf(current);
    const next=STATUS_CYCLE[(idx+1)%3];
    setDayStatuses(prev=>{const filtered=prev.filter((s:any)=>{const d=new Date(s.date);return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`!==dateKey;});return[...filtered,{date:new Date(dateKey),status:next}];});
    await toggleDayStatusAction(slug,dateKey,next);
  };

  // Bulk toggle all instances of a weekday in a month
  const handleDayOfWeekToggle=async(jsDayOfWeek:number,month:number,year:number)=>{
    // Find dominant status of this weekday in the month
    const dim=new Date(year,month,0).getDate();
    const statuses:string[]=[];
    for(let d=1;d<=dim;d++){const dt=new Date(year,month-1,d);if(dt.getDay()===jsDayOfWeek){const k=`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;statuses.push(statusMap[k]||"WORKING");}}
    const dominant=statuses.length>0?statuses[0]:"WORKING";
    const idx=STATUS_CYCLE.indexOf(dominant);
    const next=STATUS_CYCLE[(idx+1)%3];
    // Optimistic update
    setDayStatuses(prev=>{
      const newStatuses=[...prev];
      for(let d=1;d<=dim;d++){const dt=new Date(year,month-1,d);if(dt.getDay()===jsDayOfWeek){const k=`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const fi=newStatuses.findIndex((s:any)=>{const sd=new Date(s.date);return `${sd.getFullYear()}-${String(sd.getMonth()+1).padStart(2,"0")}-${String(sd.getDate()).padStart(2,"0")}`===k;});if(fi>=0)newStatuses[fi]={...newStatuses[fi],status:next};else newStatuses.push({date:dt,status:next});}}
      return newStatuses;
    });
    showToast(`All ${["Sundays","Mondays","Tuesdays","Wednesdays","Thursdays","Fridays","Saturdays"][jsDayOfWeek]} → ${STATUS_COLORS[next].label}`,true);
    await bulkToggleDayOfWeekAction(slug,jsDayOfWeek,month,year,next);
  };

  // Note modal
  const openNoteModal=(month:number,year:number,day:number)=>{
    const dateStr=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
    setSelectedDate({date:dateStr,month,year,day});
    setEditingNoteId(null);
    setNoteTitle("");
    setNoteText("");
    setNoteReminder(false);
    setNoteReminderDays(1);
    setNoteReminderType("NOTIFICATION");
    setNoteColor("#6366F1");
  };
  const editNote=(n:any)=>{
    setEditingNoteId(n.id);
    setNoteTitle(n.title||"");
    setNoteText(n.note||"");
    setNoteReminder(n.reminder||false);
    setNoteReminderDays(n.reminderDaysBefore||1);
    setNoteReminderType(n.reminderType||"NOTIFICATION");
    setNoteColor(n.color||"#6366F1");
  };
  const resetNoteForm=()=>{setEditingNoteId(null);setNoteTitle("");setNoteText("");setNoteReminder(false);setNoteReminderDays(1);setNoteReminderType("NOTIFICATION");setNoteColor("#6366F1");};
  const handleSaveNote=async()=>{
    if(!selectedDate||!noteText.trim())return;
    setSaving("note");
    const r=await saveCalendarNoteAction(slug,{id:editingNoteId||undefined,date:selectedDate.date,title:noteTitle.trim(),note:noteText.trim(),color:noteColor,reminder:noteReminder,reminderDaysBefore:noteReminderDays,reminderType:noteReminderType});
    if(r.success){showToast(editingNoteId?"Note updated!":"Note added!",true);load();resetNoteForm();}
    else showToast(r.error||"Failed",false);
    setSaving(null);
  };
  const handleDeleteNote=async(id:string)=>{setSaving(`delnote`);const r=await deleteCalendarNoteAction(slug,id);if(r.success){load();showToast("Note deleted",true);resetNoteForm();}setSaving(null);};

  // AI
  const aiHolidays = useMemo(()=>{
    const y1=academicYearStart,y2=academicYearStart+1;
    const all=[...getHolidaysSuggestions(y1),...getHolidaysSuggestions(y2)];
    const s=new Date(y1,academicStartMonth-1,1),e=new Date(y2,academicStartMonth-1,0);
    return all.filter(h=>{const d=new Date(h.date);return d>=s&&d<=e;}).filter((h,i,a)=>a.findIndex(x=>x.date===h.date&&x.name===h.name)===i).filter(h=>!holidayMap[h.date]);
  },[academicYearStart,academicStartMonth,holidayMap]);
  const handleBulkAdd=async()=>{const sel=aiHolidays.filter((_,i)=>aiSelected.has(i));if(!sel.length)return showToast("Select at least one",false);setSaving("ai-bulk");const r=await bulkAddHolidaysAction(slug,sel);if(r.success){showToast(`Added ${r.added} holidays`,true);setShowAISuggest(false);setAiSelected(new Set());load();}else showToast(r.error||"Failed",false);setSaving(null);};

  const academicMonths = useMemo(()=>{const m:{month:number;year:number}[]=[];for(let i=0;i<12;i++){const mo=((academicStartMonth-1+i)%12)+1;const y=mo>=academicStartMonth?academicYearStart:academicYearStart+1;m.push({month:mo,year:y});}return m;},[academicYearStart,academicStartMonth]);

  const yearStats=useMemo(()=>{let th=0,tw=0,hd=0;for(const{month,year}of academicMonths){const dim=new Date(year,month,0).getDate();for(let d=1;d<=dim;d++){const k=`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const st=statusMap[k]||"WORKING";if(st==="HOLIDAY")th++;else if(st==="HALFDAY")hd++;else tw++;}}return{holidays:th,working:tw,halfDays:hd};},[academicMonths,statusMap]);

  const now=new Date();const currentMonth=now.getMonth()+1;const currentYear=now.getFullYear();
  const endMonth=((academicStartMonth-2+12)%12)+1;
  
  // Carousel navigation state
  const [viewMonth, setViewMonth] = useState(currentMonth);
  const [viewYear, setViewYear] = useState(currentYear);
  const goToPrevMonth=()=>{if(viewMonth===1){setViewMonth(12);setViewYear(y=>y-1);}else setViewMonth(m=>m-1);};
  const goToNextMonth=()=>{if(viewMonth===12){setViewMonth(1);setViewYear(y=>y+1);}else setViewMonth(m=>m+1);};
  const goToToday=()=>{setViewMonth(currentMonth);setViewYear(currentYear);};
  // Sync calendar view when academic year changes
  useEffect(()=>{setViewMonth(academicStartMonth);setViewYear(academicYearStart);},[academicYearStart,academicStartMonth]);

  if(loading)return(<div style={{display:"flex",justifyContent:"center",alignItems:"center",height:400}}><Loader2 size={28} style={{animation:"spin 1s linear infinite"}} color="#6366F1"/><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

  return (
    <div style={{animation:"fadeUp 0.45s ease both",maxWidth:1200}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}} input,select,textarea{font-family:'Inter',sans-serif;font-size:13px;} .cd{cursor:pointer;transition:all 0.12s ease;position:relative;} .cd:hover{transform:scale(1.12);z-index:2;box-shadow:0 3px 12px rgba(0,0,0,0.15);}`}</style>

      {toast&&<div style={{position:"fixed",top:24,right:24,zIndex:9999,padding:"12px 20px",borderRadius:12,background:toast.ok?"#059669":"#DC2626",color:"white",fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:700,boxShadow:"0 8px 30px rgba(0,0,0,0.2)",animation:"fadeUp 0.3s ease"}}>{toast.msg}</div>}

      {/* ── Note / Reminder Modal ── */}
      {selectedDate&&createPortal(
        <div style={{position:"fixed",inset:0,zIndex:10000,display:"flex",alignItems:"center",justifyContent:"center",background:"rgba(0,0,0,0.45)",backdropFilter:"blur(5px)"}} onClick={()=>setSelectedDate(null)}>
          <div style={{background:"white",borderRadius:22,padding:28,width:460,maxWidth:"92vw",maxHeight:"90vh",overflowY:"auto",boxShadow:"0 24px 60px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
              <div>
                <h3 style={{fontFamily:"'Sora',sans-serif",fontSize:16,fontWeight:800,color:"#1E1B4B",margin:0}}>
                  {new Date(selectedDate.year,selectedDate.month-1,selectedDate.day).toLocaleDateString("en",{weekday:"long",month:"long",day:"numeric",year:"numeric"})}
                </h3>
                {holidayMap[selectedDate.date]&&<span style={{fontSize:11,fontWeight:700,color:"#EF4444",display:"block",marginTop:2}}>🎉 {holidayMap[selectedDate.date].name}</span>}
                <div style={{display:"flex",gap:6,marginTop:6}}>
                  {STATUS_CYCLE.map(st=>{const sc=STATUS_COLORS[st];const active=(statusMap[selectedDate.date]||"WORKING")===st;return(
                    <button key={st} onClick={()=>{handleDayStatusToggle(selectedDate.date);}}
                      style={{padding:"4px 10px",borderRadius:6,border:active?`2px solid ${sc.color}`:"1.5px solid #E5E7EB",background:active?sc.bg:"white",color:active?sc.color:"#9CA3AF",fontSize:10,fontWeight:700,cursor:"pointer"}}>{sc.label}</button>
                  );})}
                </div>
              </div>
              <button onClick={()=>setSelectedDate(null)} style={{width:32,height:32,borderRadius:8,border:"none",background:"#F3F4F6",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={16}/></button>
            </div>

            {/* Existing Notes List */}
            {(noteMap[selectedDate.date]||[]).length>0&&(
              <div style={{marginBottom:16}}>
                <label style={{fontSize:11,fontWeight:700,color:"#6B7280",display:"block",marginBottom:6}}>📋 Notes on this date ({(noteMap[selectedDate.date]||[]).length})</label>
                <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:180,overflowY:"auto"}}>
                  {(noteMap[selectedDate.date]||[]).map((n:any)=>(
                    <div key={n.id} style={{padding:"8px 12px",borderRadius:10,background:editingNoteId===n.id?"#EDE9FE":"#F8FAFC",border:editingNoteId===n.id?"2px solid #6366F1":"1px solid #F3F4F6",display:"flex",alignItems:"center",gap:8}}>
                      <div style={{width:4,height:28,borderRadius:2,background:n.color||"#6366F1",flexShrink:0}}/>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11,fontWeight:700,color:"#1E1B4B",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.title||"Untitled"}</div>
                        <div style={{fontSize:9,color:"#6B7280",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{n.note}</div>
                      </div>
                      {n.reminder&&<span style={{fontSize:8,fontWeight:700,padding:"2px 5px",borderRadius:4,background:"#EDE9FE",color:"#6366F1",flexShrink:0}}>🔔 {n.reminderDaysBefore}d</span>}
                      <button onClick={()=>editNote(n)} title="Edit" style={{width:24,height:24,borderRadius:6,border:"none",background:editingNoteId===n.id?"#6366F1":"#E5E7EB",color:editingNoteId===n.id?"white":"#6B7280",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>✏️</button>
                      <button onClick={()=>handleDeleteNote(n.id)} title="Delete" style={{width:24,height:24,borderRadius:6,border:"none",background:"#FEE2E2",color:"#DC2626",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,flexShrink:0}}>🗑</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add / Edit Note Form */}
            <div style={{background:editingNoteId?"#FAFBFF":"white",borderRadius:14,padding:14,border:editingNoteId?"2px solid #6366F1":"1.5px solid #E5E7EB",marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:700,color:"#6B7280",display:"block",marginBottom:6}}>{editingNoteId?"✏️ Edit Note":"➕ New Note"}</label>
              <input type="text" value={noteTitle} onChange={e=>setNoteTitle(e.target.value)} placeholder="Title (e.g. Parent Meeting, Report Day...)"
                style={{width:"100%",height:36,borderRadius:8,border:"1.5px solid #E5E7EB",padding:"0 12px",fontWeight:700,color:"#1E1B4B",outline:"none",marginBottom:8,boxSizing:"border-box",fontSize:12}}/>
              <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add notes, event details, instructions..." rows={2}
                style={{width:"100%",borderRadius:8,border:"1.5px solid #E5E7EB",padding:10,fontWeight:500,color:"#1E1B4B",outline:"none",resize:"vertical",boxSizing:"border-box",fontSize:12}}/>
              
              {/* Color picker */}
              <div style={{marginTop:8,display:"flex",alignItems:"center",gap:8}}>
                <label style={{fontSize:10,fontWeight:700,color:"#6B7280"}}>Color:</label>
                {["#6366F1","#EF4444","#F59E0B","#059669","#EC4899","#0891B2"].map(c=>(
                  <div key={c} onClick={()=>setNoteColor(c)} style={{width:18,height:18,borderRadius:5,background:c,border:noteColor===c?"3px solid #1E1B4B":"2px solid transparent",cursor:"pointer",transition:"all 0.15s"}}/>
                ))}
              </div>
            </div>

            {/* Reminder Section */}
            <div style={{background:"#F8FAFC",borderRadius:14,padding:14,marginBottom:16,border:"1px solid #F3F4F6"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:noteReminder?12:0}}>
                <div style={{display:"flex",alignItems:"center",gap:6}}>
                  {noteReminder?<Bell size={15} color="#6366F1"/>:<BellOff size={15} color="#9CA3AF"/>}
                  <span style={{fontSize:12,fontWeight:700,color:noteReminder?"#1E1B4B":"#9CA3AF"}}>Set Reminder</span>
                </div>
                <button onClick={()=>setNoteReminder(!noteReminder)}
                  style={{background:"none",border:"none",cursor:"pointer",padding:2}}>
                  {noteReminder?<ToggleRight size={24} color="#6366F1"/>:<ToggleLeft size={24} color="#D1D5DB"/>}
                </button>
              </div>
              {noteReminder&&(
                <div style={{display:"flex",gap:10,flexWrap:"wrap",animation:"fadeUp 0.2s ease"}}>
                  <div style={{flex:1,minWidth:120}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#6B7280",display:"block",marginBottom:4}}>Remind Before</label>
                    <div style={{display:"flex",gap:4}}>
                      {[0,1,2,3,5,7,14,30].map(d=>(
                        <button key={d} onClick={()=>setNoteReminderDays(d)}
                          style={{padding:"4px 8px",borderRadius:6,border:noteReminderDays===d?"2px solid #6366F1":"1px solid #E5E7EB",background:noteReminderDays===d?"#EDE9FE":"white",color:noteReminderDays===d?"#4F46E5":"#6B7280",fontSize:10,fontWeight:700,cursor:"pointer"}}>
                          {d===0?"Same day":`${d}d`}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div style={{minWidth:100}}>
                    <label style={{fontSize:10,fontWeight:700,color:"#6B7280",display:"block",marginBottom:4}}>Type</label>
                    <select value={noteReminderType} onChange={e=>setNoteReminderType(e.target.value)} title="Reminder type"
                      style={{height:30,borderRadius:6,border:"1px solid #E5E7EB",padding:"0 8px",fontWeight:600,color:"#1E1B4B",outline:"none",width:"100%"}}>
                      <option value="NOTIFICATION">🔔 Notification</option>
                      <option value="EMAIL">📧 Email</option>
                      <option value="SMS">💬 SMS</option>
                      <option value="ALL">📢 All Channels</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div style={{display:"flex",gap:10}}>
              {editingNoteId&&(
                <button onClick={resetNoteForm}
                  style={{height:40,padding:"0 14px",borderRadius:10,border:"1.5px solid #E5E7EB",background:"white",color:"#6B7280",fontSize:12,fontWeight:700,cursor:"pointer"}}>
                  Cancel Edit
                </button>
              )}
              <div style={{flex:1}}/>
              <button onClick={handleSaveNote} disabled={saving==="note"||!noteText.trim()}
                style={{height:40,padding:"0 20px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#6366F1,#8B5CF6)",color:"white",fontSize:12,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5,opacity:saving==="note"||!noteText.trim()?0.5:1}}>
                {saving==="note"?<Loader2 size={13} style={{animation:"spin 1s linear infinite"}}/>:<Check size={13}/>} {editingNoteId?"Update":"Add Note"}
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* ── Header ── */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:22,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:46,height:46,borderRadius:13,background:"linear-gradient(135deg,#6366F1,#8B5CF6)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 6px 20px rgba(99,102,241,0.25)"}}><Calendar size={21} color="white" strokeWidth={2}/></div>
          <div>
            <h1 style={{fontFamily:"'Sora',sans-serif",fontSize:19,fontWeight:800,color:"#1E1B4B",margin:0}}>School Calendar</h1>
            <p style={{fontSize:11.5,color:"#9CA3AF",margin:"2px 0 0",fontWeight:500}}>{MN[academicStartMonth-1]} – {MN[endMonth-1]} · Click dates to add notes & toggle status</p>
          </div>
        </div>
        <button onClick={()=>setShowAISuggest(!showAISuggest)}
          style={{height:38,padding:"0 14px",borderRadius:10,border:"none",background:showAISuggest?"#FEE2E2":"linear-gradient(135deg,#F59E0B,#F97316)",color:showAISuggest?"#DC2626":"white",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
          {showAISuggest?<><X size={13}/> Close</>:<><Sparkles size={13}/> AI Suggest Holidays</>}
        </button>
      </div>

      {/* ── AI Suggest ── */}
      {showAISuggest&&(
        <div style={{background:"linear-gradient(135deg,#FFFBEB,#FEF3C7)",borderRadius:16,padding:20,marginBottom:16,border:"1px solid #FDE68A",animation:"fadeUp 0.3s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:6}}><Sparkles size={16} color="#F59E0B"/><h3 style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:"#92400E",margin:0}}>AI Suggested Holidays {academicYearStart}–{academicYearStart+1}</h3></div>
            <div style={{display:"flex",gap:6}}>
              <button onClick={()=>setAiSelected(new Set(aiHolidays.map((_,i)=>i)))} style={{height:30,padding:"0 10px",borderRadius:7,border:"1px solid #F59E0B",background:"white",color:"#92400E",fontSize:10,fontWeight:700,cursor:"pointer"}}>Select All</button>
              <button onClick={handleBulkAdd} disabled={saving==="ai-bulk"||aiSelected.size===0} style={{height:30,padding:"0 12px",borderRadius:7,border:"none",background:"linear-gradient(135deg,#059669,#10B981)",color:"white",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:3,opacity:saving==="ai-bulk"||aiSelected.size===0?0.5:1}}>
                {saving==="ai-bulk"?<Loader2 size={11} style={{animation:"spin 1s linear infinite"}}/>:<Plus size={11}/>} Add {aiSelected.size}
              </button>
            </div>
          </div>
          {aiHolidays.length===0?<p style={{color:"#92400E",fontSize:11,fontWeight:600,textAlign:"center"}}>All suggested holidays already added! ✓</p>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:6,maxHeight:280,overflowY:"auto"}}>
            {aiHolidays.map((h,i)=>{const tc=HOLIDAY_TYPES.find(t=>t.value===h.type)||HOLIDAY_TYPES[0];const sel=aiSelected.has(i);return(
              <div key={i} onClick={()=>{const ns=new Set(aiSelected);sel?ns.delete(i):ns.add(i);setAiSelected(ns);}}
                style={{padding:"6px 10px",borderRadius:8,background:sel?"#D1FAE5":"white",border:sel?"2px solid #059669":"1px solid #E5E7EB",cursor:"pointer",transition:"all 0.12s"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:11,fontWeight:700,color:"#1E1B4B"}}>{h.name}</span>{sel&&<Check size={12} color="#059669" strokeWidth={3}/>}</div>
                <div style={{display:"flex",gap:4,marginTop:3}}><span style={{fontSize:8,fontWeight:700,padding:"1px 4px",borderRadius:3,background:tc.bg,color:tc.color}}>{tc.label}</span><span style={{fontSize:9,color:"#6B7280"}}>{new Date(h.date).toLocaleDateString("en",{month:"short",day:"numeric"})}</span></div>
              </div>
            );})}
          </div>)}
        </div>
      )}

      {/* ── Stats + Timings Row ── */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10,marginBottom:16}}>
        {[
          {label:"Working Days",value:yearStats.working,icon:"📅",color:"#059669",bg:"#D1FAE5"},
          {label:"Half Days",value:yearStats.halfDays,icon:"🌤",color:"#D97706",bg:"#FEF3C7"},
          {label:"Holidays",value:yearStats.holidays,icon:"🎉",color:"#DC2626",bg:"#FEE2E2"},
          {label:"Marked Holidays",value:holidays.filter((h:any)=>h.isHoliday!==false).length,icon:"⭐",color:"#6366F1",bg:"#EDE9FE"},
          {label:"Notes & Reminders",value:calendarNotes.length,icon:"📝",color:"#8B5CF6",bg:"#F3E8FF"},
        ].map((s,i)=>(
          <div key={i} style={{background:"white",borderRadius:14,padding:"12px 14px",border:"1px solid #F3F4F6",boxShadow:"0 2px 14px rgba(0,0,0,0.04)",display:"flex",alignItems:"center",gap:10}}>
            <div style={{width:36,height:36,borderRadius:9,background:s.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>{s.icon}</div>
            <div><div style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:800,color:s.color}}>{s.value}</div><div style={{fontSize:9,color:"#9CA3AF",fontWeight:600}}>{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* ── Timings (compact) ── */}
      <div style={{background:"white",borderRadius:16,padding:"14px 20px",marginBottom:14,boxShadow:"0 2px 14px rgba(0,0,0,0.04)",border:"1px solid #F3F4F6",display:"flex",alignItems:"center",gap:12}}>
        <Clock size={16} color="#6366F1"/><span style={{fontFamily:"'Sora',sans-serif",fontSize:13,fontWeight:700,color:"#1E1B4B"}}>School Timings</span>
        <input type="text" value={timings} onChange={e=>setTimings(e.target.value)} placeholder="9:00 AM - 3:00 PM"
          style={{flex:1,height:36,borderRadius:8,border:"1.5px solid #E5E7EB",padding:"0 12px",fontWeight:600,color:"#1E1B4B",outline:"none",maxWidth:300}}/>
        <button onClick={saveTimings} disabled={saving==="timings"}
          style={{height:36,padding:"0 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#6366F1,#8B5CF6)",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,opacity:saving==="timings"?0.6:1}}>
          {saving==="timings"?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<Check size={12}/>} Save
        </button>
      </div>

      {/* ── Calendar Section ── */}
      <div style={{background:"linear-gradient(180deg, #FAFBFF 0%, white 100%)",borderRadius:24,padding:"0",marginBottom:16,boxShadow:"0 8px 40px rgba(99,102,241,0.08)",border:"1px solid #E5E7EB",overflow:"hidden"}}>
        {/* Gradient Header */}
        <div style={{background:"linear-gradient(135deg,#1E1B4B 0%,#312E81 40%,#4338CA 100%)",padding:"20px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:42,height:42,borderRadius:12,background:"rgba(255,255,255,0.15)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <CalendarDays size={22} color="white"/>
            </div>
            <div>
              <h2 style={{fontFamily:"'Sora',sans-serif",fontSize:18,fontWeight:800,color:"white",margin:0}}>School Calendar</h2>
              <span style={{fontSize:10,fontWeight:600,color:"rgba(255,255,255,0.6)"}}>{MN[academicStartMonth-1].slice(0,3)} {academicYearStart} – {MN[endMonth-1].slice(0,3)} {academicYearStart+1}</span>
            </div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={()=>setAcademicYearStart(y=>y-1)} title="Previous Year" style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronLeft size={14} color="white"/></button>
            <button onClick={()=>setAcademicYearStart(y=>y+1)} title="Next Year" style={{width:32,height:32,borderRadius:8,border:"1px solid rgba(255,255,255,0.2)",background:"rgba(255,255,255,0.1)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><ChevronRight size={14} color="white"/></button>
          </div>
        </div>

        {/* Navigation Bar */}
        <div style={{padding:"16px 24px 0",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={goToPrevMonth} title="Previous Month"
              style={{width:38,height:38,borderRadius:10,border:"none",background:"linear-gradient(135deg,#EDE9FE,#DDD6FE)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(99,102,241,0.15)",transition:"all 0.2s"}}>
              <ChevronLeft size={18} color="#4F46E5"/>
            </button>
            <div style={{display:"flex",alignItems:"center",gap:6}}>
              <select value={`${viewMonth}-${viewYear}`} onChange={e=>{const [m,y]=e.target.value.split("-");setViewMonth(Number(m));setViewYear(Number(y));}} title="Select Month"
                style={{height:38,borderRadius:10,border:"2px solid #E5E7EB",padding:"0 12px",fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:800,color:"#1E1B4B",outline:"none",cursor:"pointer",background:"white",minWidth:180}}>
                {academicMonths.map(({month,year})=><option key={`${month}-${year}`} value={`${month}-${year}`}>{MN[month-1]} {year}</option>)}
              </select>
            </div>
            <button onClick={goToNextMonth} title="Next Month"
              style={{width:38,height:38,borderRadius:10,border:"none",background:"linear-gradient(135deg,#EDE9FE,#DDD6FE)",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 8px rgba(99,102,241,0.15)",transition:"all 0.2s"}}>
              <ChevronRight size={18} color="#4F46E5"/>
            </button>
            {(viewMonth!==currentMonth||viewYear!==currentYear)&&(
              <button onClick={goToToday} style={{height:32,padding:"0 12px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#6366F1,#8B5CF6)",color:"white",fontSize:10,fontWeight:700,cursor:"pointer",marginLeft:4}}>Today</button>
            )}
          </div>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            {[{l:"Working",c1:"#34D399",c2:"#059669"},{l:"Half Day",c1:"#FCD34D",c2:"#F59E0B"},{l:"Holiday",c1:"#FCA5A5",c2:"#EF4444"},{l:"Today",c1:"#1E1B4B",c2:"#1E1B4B"},{l:"Has Notes",c1:"#8B5CF6",c2:"#C4B5FD"}].map(l=>(
              <div key={l.l} style={{display:"flex",alignItems:"center",gap:3}}><div style={{width:10,height:10,borderRadius:3,background:"white",boxShadow:`inset 0 0 0 1.5px ${l.c1}, inset 0 0 0 3px ${l.c2}30`}}/><span style={{fontSize:9,fontWeight:600,color:"#6B7280"}}>{l.l}</span></div>
            ))}
          </div>
        </div>

        {/* Single Month View */}
        <div style={{padding:"16px 24px 24px"}}>
          <HeroMonth month={viewMonth} year={viewYear} holidayMap={holidayMap} noteMap={noteMap} statusMap={statusMap} onToggle={handleDayStatusToggle} onNote={openNoteModal} onDayHeaderToggle={handleDayOfWeekToggle}/>
        </div>
      </div>

      {/* ── Holidays List ── */}
      <div style={{background:"white",borderRadius:20,padding:22,boxShadow:"0 4px 24px rgba(0,0,0,0.06)",border:"1px solid #F3F4F6"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}><Star size={16} color="#EF4444"/><h2 style={{fontFamily:"'Sora',sans-serif",fontSize:14,fontWeight:700,color:"#1E1B4B",margin:0}}>Holidays & Events ({holidays.length})</h2></div>
          <button onClick={()=>setShowAddForm(!showAddForm)} style={{height:32,padding:"0 10px",borderRadius:8,border:"none",background:showAddForm?"#FEE2E2":"linear-gradient(135deg,#6366F1,#8B5CF6)",color:showAddForm?"#DC2626":"white",fontSize:10,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4}}>
            {showAddForm?"Cancel":<><Plus size={12}/> Add</>}
          </button>
        </div>
        {showAddForm&&(
          <div style={{background:"#F8FAFC",borderRadius:12,padding:14,marginBottom:12,border:"1px dashed #D1D5DB",animation:"fadeUp 0.3s ease"}}>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:8}}>
              <input type="text" placeholder="Holiday name" value={newHoliday.name} onChange={e=>setNewHoliday({...newHoliday,name:e.target.value})} style={{height:36,borderRadius:8,border:"1.5px solid #E5E7EB",padding:"0 12px",fontWeight:600,color:"#1E1B4B",outline:"none"}}/>
              <input type="date" value={newHoliday.date} onChange={e=>setNewHoliday({...newHoliday,date:e.target.value})} style={{height:36,borderRadius:8,border:"1.5px solid #E5E7EB",padding:"0 12px",fontWeight:600,color:"#1E1B4B",outline:"none"}}/>
            </div>
            <div style={{display:"flex",gap:8,alignItems:"center"}}>
              <select value={newHoliday.type} onChange={e=>setNewHoliday({...newHoliday,type:e.target.value})} title="Holiday type" style={{height:36,borderRadius:8,border:"1.5px solid #E5E7EB",padding:"0 12px",fontWeight:600,color:"#1E1B4B",outline:"none",flex:1}}>
                {HOLIDAY_TYPES.map(t=><option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <button onClick={handleAddHoliday} disabled={saving==="holiday"} style={{height:36,padding:"0 14px",borderRadius:8,border:"none",background:"linear-gradient(135deg,#059669,#10B981)",color:"white",fontSize:11,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:4,opacity:saving==="holiday"?0.6:1}}>
                {saving==="holiday"?<Loader2 size={12} style={{animation:"spin 1s linear infinite"}}/>:<Check size={12}/>} Add
              </button>
            </div>
          </div>
        )}
        {holidays.length===0?<div style={{textAlign:"center",padding:28,color:"#9CA3AF"}}><CalendarDays size={30} style={{opacity:0.3,marginBottom:5}}/><p style={{fontWeight:600,margin:0,fontSize:11}}>No holidays yet</p></div>:(
          <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:380,overflowY:"auto"}}>
            {holidays.map((h:any)=>{const tc=HOLIDAY_TYPES.find(t=>t.value===h.type)||HOLIDAY_TYPES[0];const d=new Date(h.date);const isOff=h.isHoliday!==false;return(
              <div key={h.id} style={{display:"flex",alignItems:"center",gap:8,padding:"7px 10px",borderRadius:10,background:isOff?"#FAFBFE":"#FEFCE8",border:"1px solid #F3F4F6",opacity:isOff?1:0.65}}>
                <div style={{width:34,height:34,borderRadius:8,background:tc.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
                  <span style={{fontSize:12,fontWeight:900,color:tc.color,lineHeight:1}}>{d.getDate()}</span>
                  <span style={{fontSize:7,fontWeight:700,color:tc.color}}>{d.toLocaleDateString("en",{month:"short"})}</span>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:11,fontWeight:700,color:"#1E1B4B"}}>{h.name}{h.isAISuggested&&<span style={{marginLeft:4,fontSize:8,fontWeight:700,padding:"1px 4px",borderRadius:3,background:"#FEF3C7",color:"#92400E"}}>AI</span>}</div>
                  <div style={{display:"flex",gap:4,marginTop:1}}>
                    <span style={{fontSize:8,fontWeight:700,padding:"1px 4px",borderRadius:3,background:tc.bg,color:tc.color}}>{tc.label}</span>
                    <span style={{fontSize:9,color:"#9CA3AF"}}>{d.toLocaleDateString("en",{weekday:"short",month:"short",day:"numeric"})}</span>
                    {!isOff&&<span style={{fontSize:8,fontWeight:700,padding:"1px 3px",borderRadius:3,background:"#FEF3C7",color:"#F59E0B"}}>Working</span>}
                  </div>
                </div>
                <button onClick={()=>handleToggleHoliday(h.id,isOff)} disabled={saving===`tog-${h.id}`} title={isOff?"Mark working":"Mark holiday"}
                  style={{background:"none",border:"none",cursor:"pointer",padding:3,opacity:saving===`tog-${h.id}`?0.5:1}}>
                  {isOff?<ToggleRight size={20} color="#059669"/>:<ToggleLeft size={20} color="#9CA3AF"/>}
                </button>
                <button onClick={()=>handleDeleteHoliday(h.id)} disabled={saving===`del-${h.id}`}
                  style={{width:26,height:26,borderRadius:6,border:"none",background:"#FEE2E2",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",opacity:saving===`del-${h.id}`?0.5:1,flexShrink:0}}>
                  {saving===`del-${h.id}`?<Loader2 size={10} color="#DC2626" style={{animation:"spin 1s linear infinite"}}/>:<Trash2 size={10} color="#DC2626"/>}
                </button>
              </div>
            );})}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Hero Month (Current — Large) ── */
function HeroMonth({month,year,holidayMap,noteMap,statusMap,onToggle,onNote,onDayHeaderToggle}:{month:number;year:number;holidayMap:Record<string,any>;noteMap:Record<string,any[]>;statusMap:Record<string,string>;onToggle:(k:string)=>void;onNote:(m:number,y:number,d:number)=>void;onDayHeaderToggle:(dow:number,m:number,y:number)=>void}) {
  const today=new Date();const dim=new Date(year,month,0).getDate();const fdw=new Date(year,month-1,1).getDay();const so=fdw===0?6:fdw-1;
  const cells:(number|null)[]=[];for(let i=0;i<so;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);while(cells.length%7)cells.push(null);
  const counts={w:0,h:0,hd:0};for(let d=1;d<=dim;d++){const k=`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;const hol=holidayMap[k];const st=(hol&&hol.isHoliday!==false)?"HOLIDAY":statusMap[k]||"WORKING";if(st==="HOLIDAY")counts.h++;else if(st==="HALFDAY")counts.hd++;else counts.w++;}

  return(
    <div style={{borderRadius:14,overflow:"hidden",background:"white"}}>
      <div style={{padding:"8px 12px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#F8FAFC",borderBottom:"1px solid #F3F4F6"}}>
        <span style={{fontFamily:"'Sora',sans-serif",fontSize:15,fontWeight:800,color:"#1E1B4B"}}>{MN[month-1]} {year}</span>
        <div style={{display:"flex",gap:10}}><span style={{fontSize:11,fontWeight:700,color:"#059669"}}>🟢 {counts.w} Working</span><span style={{fontSize:11,fontWeight:700,color:"#D97706"}}>🟡 {counts.hd} Half</span><span style={{fontSize:11,fontWeight:700,color:"#DC2626"}}>🔴 {counts.h} Holiday</span></div>
      </div>
      <div style={{padding:"10px 12px 14px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3,marginBottom:2}}>
          {[{n:"Mon",d:1},{n:"Tue",d:2},{n:"Wed",d:3},{n:"Thu",d:4},{n:"Fri",d:5},{n:"Sat",d:6},{n:"Sun",d:0}].map((day,i)=>{
            // Find dominant status for this weekday
            const dim2=new Date(year,month,0).getDate();let ws=0,hs=0,hds=0;
            for(let dd=1;dd<=dim2;dd++){const dt2=new Date(year,month-1,dd);if(dt2.getDay()===day.d){const k2=`${year}-${String(month).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;const s2=statusMap[k2]||"WORKING";if(s2==="HOLIDAY")hs++;else if(s2==="HALFDAY")hds++;else ws++;}}
            const dominant=hs>=ws&&hs>=hds?"HOLIDAY":hds>=ws?"HALFDAY":"WORKING";
            const sc=STATUS_COLORS[dominant];
            return(<div key={i} onClick={()=>onDayHeaderToggle(day.d,month,year)} title={`Click to toggle all ${day.n}s`}
              style={{textAlign:"center",fontSize:10,fontWeight:800,color:sc.color,padding:"4px 0",borderRadius:5,background:sc.bg,cursor:"pointer",transition:"all 0.15s",border:`1.5px solid ${sc.color}40`}}>{day.n}</div>);
          })}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:3}}>
          {cells.map((day,i)=>{
            if(!day)return<div key={i} style={{aspectRatio:"1"}}/>;  
            const k=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const hol=holidayMap[k];const notes=noteMap[k]||[];const isToday=day===today.getDate()&&month===today.getMonth()+1&&year===today.getFullYear();
            // If holiday is enabled (isHoliday=true), force HOLIDAY status
            const effectiveSt=(hol&&hol.isHoliday!==false&&(hol.type==="HOLIDAY"||hol.type==="RESTRICTED"))?"HOLIDAY":statusMap[k]||"WORKING";
            const sc=STATUS_COLORS[effectiveSt];
            // Show label: holiday name or event name
            let label="";let labelColor=sc.color;
            if(hol){
              label=hol.name;
              const ht=HOLIDAY_TYPES.find((t:any)=>t.value===hol.type);
              if(ht)labelColor=ht.color;
            }
            // Note titles for hero view
            const noteTitles=notes.map((n:any)=>n.title||"Note").slice(0,2);
            return(<div key={i} className="cd" onClick={()=>onNote(month,year,day)} onContextMenu={e=>{e.preventDefault();onToggle(k);}}
              style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"flex-start",justifyContent:"flex-start",borderRadius:8,background:"white",fontSize:13,fontWeight:700,position:"relative",cursor:"pointer",overflow:"hidden",padding:"4px 5px",
                border:isToday?"2.5px solid #1E1B4B":"1px solid #E5E7EB",boxShadow:isToday?"0 2px 10px rgba(0,0,0,0.12)":"none"}}>
              <span style={{fontWeight:800,fontSize:14,color:sc.color}}>{day}</span>
              {label&&<span style={{fontSize:8,fontWeight:700,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.2,color:labelColor}}>🔴 {label}</span>}
              {noteTitles.map((t:string,ti:number)=><span key={ti} style={{fontSize:8.5,fontWeight:600,maxWidth:"100%",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",lineHeight:1.3,color:notes[ti]?.color||"#8B5CF6"}}>• {t}</span>)}
              {notes.length>2&&<span style={{fontSize:7,fontWeight:700,color:"#8B5CF6"}}>+{notes.length-2} more</span>}
              {hol&&hol.type==="EVENT"&&!hol.isHoliday&&<div style={{position:"absolute",bottom:2,right:3,width:5,height:5,borderRadius:"50%",background:"#6366F1"}}/>}
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Mini Month (Compact) ── */
function MiniMonth({month,year,holidayMap,noteMap,statusMap,onToggle,onNote,onDayHeaderToggle}:{month:number;year:number;holidayMap:Record<string,any>;noteMap:Record<string,any[]>;statusMap:Record<string,string>;onToggle:(k:string)=>void;onNote:(m:number,y:number,d:number)=>void;onDayHeaderToggle:(dow:number,m:number,y:number)=>void}) {
  const today=new Date();const ic=today.getMonth()+1===month&&today.getFullYear()===year;const dim=new Date(year,month,0).getDate();const fdw=new Date(year,month-1,1).getDay();const so=fdw===0?6:fdw-1;
  const cells:(number|null)[]=[];for(let i=0;i<so;i++)cells.push(null);for(let d=1;d<=dim;d++)cells.push(d);while(cells.length%7)cells.push(null);
  let mhc=0;for(let d=1;d<=dim;d++){const k=`${year}-${String(month).padStart(2,"0")}-${String(d).padStart(2,"0")}`;if(statusMap[k]==="HOLIDAY"||holidayMap[k])mhc++;}

  return(
    <div style={{borderRadius:12,border:"1px solid #F3F4F6",background:"#FAFBFE",overflow:"hidden"}}>
      <div style={{padding:"5px 10px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#F8FAFC",borderBottom:"1px solid #F3F4F6"}}>
        <span style={{fontFamily:"'Sora',sans-serif",fontSize:11,fontWeight:800,color:"#1E1B4B"}}>{MN[month-1]}</span>
        <div style={{display:"flex",gap:4,alignItems:"center"}}>
          {mhc>0&&<span style={{fontSize:8,fontWeight:700,color:"#EF4444",padding:"1px 4px",borderRadius:3,background:"#FEE2E2"}}>{mhc}</span>}
          <span style={{fontSize:9,fontWeight:700,color:"#9CA3AF"}}>{year}</span>
        </div>
      </div>
      <div style={{padding:"3px 6px 6px"}}>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1,marginBottom:1}}>
          {[{n:"M",d:1},{n:"T",d:2},{n:"W",d:3},{n:"T",d:4},{n:"F",d:5},{n:"S",d:6},{n:"S",d:0}].map((day,i)=>{
            const dim2=new Date(year,month,0).getDate();let ws2=0,hs2=0,hds2=0;
            for(let dd=1;dd<=dim2;dd++){const dt2=new Date(year,month-1,dd);if(dt2.getDay()===day.d){const k2=`${year}-${String(month).padStart(2,"0")}-${String(dd).padStart(2,"0")}`;const s2=statusMap[k2]||"WORKING";if(s2==="HOLIDAY")hs2++;else if(s2==="HALFDAY")hds2++;else ws2++;}}
            const dom=hs2>=ws2&&hs2>=hds2?"HOLIDAY":hds2>=ws2?"HALFDAY":"WORKING";
            const sc2=STATUS_COLORS[dom];
            return(<div key={i} onClick={()=>onDayHeaderToggle(day.d,month,year)} title="Toggle all"
              style={{textAlign:"center",fontSize:8,fontWeight:800,color:sc2.color,padding:"2px 0",borderRadius:3,background:sc2.bg,cursor:"pointer",border:`1px solid ${sc2.color}30`}}>{day.n}</div>);
          })}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:1}}>
          {cells.map((day,i)=>{
            if(!day)return<div key={i} style={{aspectRatio:"1"}}/>;  
            const k=`${year}-${String(month).padStart(2,"0")}-${String(day).padStart(2,"0")}`;
            const hol=holidayMap[k];const notes=noteMap[k]||[];const isToday=day===today.getDate()&&ic;
            // If holiday is enabled, force HOLIDAY
            const effectiveSt=(hol&&hol.isHoliday!==false&&(hol.type==="HOLIDAY"||hol.type==="RESTRICTED"))?"HOLIDAY":statusMap[k]||"WORKING";
            const sc=STATUS_COLORS[effectiveSt];
            const ht=hol?HOLIDAY_TYPES.find((t:any)=>t.value===hol.type):null;
            return(<div key={i} className="cd" onClick={()=>onNote(month,year,day)} onContextMenu={e=>{e.preventDefault();onToggle(k);}}
              title={hol?hol.name:notes.length?notes.map((n:any)=>n.title||"Note").join(", "):undefined}
              style={{aspectRatio:"1",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",borderRadius:4,background:sc.bg,fontSize:9,fontWeight:600,color:sc.color,position:"relative",cursor:"pointer",overflow:"hidden",
                border:isToday?"2px solid #1E1B4B":notes.length?"1.5px solid #8B5CF6":hol?`1px solid ${ht?.color||sc.color}50`:"none"}}>
              {day}
              {hol&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:ht?.color||"#6366F1"}}/>}
              {notes.length>0&&!hol&&<div style={{position:"absolute",bottom:0,left:"50%",transform:"translateX(-50%)",width:3,height:3,borderRadius:"50%",background:"#8B5CF6"}}/>}
            </div>);
          })}
        </div>
      </div>
    </div>
  );
}
