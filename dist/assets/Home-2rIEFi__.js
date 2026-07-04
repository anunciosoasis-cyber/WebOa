import{g as s,k as e,A as I,l as w,x as W,y as O,q as T,K as G,o as A,z as H,L as K,X,C as q,J as Q}from"./index-C4XvBcIc.js";import{C as V}from"./clock-5UenEQnm.js";import{U as Z}from"./user-CRdxeltX.js";import{M as Y,a as ee,L as te,A as ie}from"./lucide-react-BObk1TlR.js";import{G as oe}from"./GlassCard-R1ghxclU.js";import"./upload-Uu3AUF-u.js";import"./check-BaGoiMmw.js";import"./zap-v1haQU8n.js";import"./circle-check-BXCEEyVa.js";import"./youtube-DeigLNbs.js";import"./circle-question-mark-CIziY3U3.js";import"./tree-pine-DEK7nGbz.js";import"./cloud-upload-C-n06SZg.js";import"./eye-off--S8tx-8f.js";import"./database-bi0G7xJa.js";import"./download-iUkfG-Ij.js";import"./eye-DlKwsKsM.js";import"./file-text-xqqFRq4A.js";import"./image-DgKsbQbT.js";import"./loader-circle-xZbtk_lG.js";import"./pen-line-BQOjl4bj.js";import"./minimize-FuFvLMP1.js";import"./music-GTlBYY3N.js";import"./users-round-B_2Yz0r6.js";import"./panels-top-left-BIsgWL8j.js";import"./timer-Bw2oed8-.js";import"./pencil-B2KmPbHJ.js";import"./plus-DFduEZCN.js";import"./refresh-ccw-CdsWPaka.js";import"./rotate-ccw-CGq-w9tE.js";import"./save-DnkhYMb5.js";import"./user-plus-CduGHwVj.js";import"./trash-2-Cp3H3h3l.js";import"./user-check-DWhIBy3s.js";const M=[{url:"https://images.unsplash.com/photo-1511895426328-dc8714191300?q=90&w=3840&auto=format&fit=crop",title:"Unidos en Familia",description:"En Oasis, cada hogar encuentra un refugio de paz. Fortaleciendo los lazos del amor cristiano en cada generación.",accent:"Generaciones"},{url:"https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=90&w=3840&auto=format&fit=crop",title:"Juventud con Propósito",description:"Liderando con fe y energía. Una comunidad donde los jóvenes transforman el mundo a través del servicio a Dios.",accent:"Dinamismo"},{url:"https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=90&w=3840&auto=format&fit=crop",title:"Esperanza Bendita",description:"Caminando juntos hacia el encuentro con nuestro Creador. La unidad de la iglesia es nuestra mayor fortaleza.",accent:"Advenimiento"},{url:"https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=90&w=3840&auto=format&fit=crop",title:"Comunidad Viva",description:"Más que una iglesia, somos un cuerpo unido en la misión de compartir el evangelio eterno a toda nación.",accent:"Misión"}],ne=()=>{const[l,g]=s.useState(0),[b,y]=s.useState(null),c=s.useRef(null);s.useEffect(()=>{const u="https://oasis-backend-latest.onrender.com".replace(/\/$/,""),x=u.endsWith("/api")?`${u}/public/settings`:`${u}/api/public/settings`;fetch(x).then(d=>d.json()).then(d=>{d.bg_image&&y(d.bg_image)}).catch(d=>console.error("Hero bg load error:",d))},[]),s.useEffect(()=>(p(),()=>r()),[l]);const p=()=>{r(),c.current=setInterval(()=>n(),1e4)},r=()=>{c.current&&clearInterval(c.current)},n=()=>g(u=>u>=M.length-1?0:u+1),f=()=>g(u=>u===0?M.length-1:u-1),m=M[l];return e.jsxs("section",{className:"relative h-screen min-h-[700px] w-full overflow-hidden bg-[#08050D] flex items-center px-6 lg:px-24",children:[e.jsx(I,{mode:"popLayout",children:e.jsxs(w.div,{initial:{opacity:0,scale:1.1},animate:{opacity:1,scale:1},exit:{opacity:0,scale:1.05},transition:{duration:2.5,ease:"easeInOut"},className:"absolute inset-0 z-0",style:{backgroundImage:`url(${b||m.url})`,backgroundSize:"cover",backgroundPosition:"center"},children:[e.jsx("div",{className:"absolute inset-0 bg-[#08050D]/60 mix-blend-multiply z-10"}),e.jsx("div",{className:"absolute inset-0 bg-gradient-to-r from-[#120C1F]/90 via-[#120C1F]/40 to-transparent z-20"}),e.jsx("div",{className:"absolute inset-0 backdrop-blur-[1px] z-30"})]},l)}),e.jsx("div",{className:"container relative z-40 text-white w-full",children:e.jsx(I,{mode:"wait",children:e.jsxs(w.div,{initial:{opacity:0,y:30},animate:{opacity:1,y:0},exit:{opacity:0,y:-20},transition:{duration:1.2,ease:"easeOut"},className:"max-w-4xl",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-6",children:[e.jsx("div",{className:"h-[2px] w-10 bg-[#F59E0B]"}),e.jsx("span",{className:"text-[10px] font-black tracking-[0.4em] text-[#F59E0B] uppercase",children:m.accent})]}),e.jsx("h1",{style:{fontFamily:"Moonrising, sans-serif"},className:"text-5xl md:text-7xl lg:text-[85px] font-bold tracking-tighter leading-[0.9] mb-8 drop-shadow-2xl uppercase",children:m.title}),e.jsx("p",{className:"max-w-xl text-lg md:text-xl font-light text-white/70 leading-relaxed border-l-2 border-[#F59E0B]/30 pl-8 mb-10 italic",children:m.description})]},l)})}),e.jsx("div",{className:"absolute bottom-12 left-6 lg:left-24 flex items-center gap-4 z-50",children:M.map((u,x)=>e.jsx("button",{onClick:()=>g(x),className:`h-1 transition-all duration-1000 rounded-full ${x===l?"w-16 bg-[#F59E0B]":"w-4 bg-white/20 hover:bg-white/40"}`},x))}),e.jsxs("div",{className:"hidden lg:block",children:[e.jsx("button",{onClick:f,className:"absolute left-8 top-1/2 -translate-y-1/2 z-50 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 hover:text-[#F59E0B] transition-all backdrop-blur-sm active:scale-90",children:e.jsx(W,{size:28})}),e.jsx("button",{onClick:n,className:"absolute right-8 top-1/2 -translate-y-1/2 z-50 p-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 hover:text-[#F59E0B] transition-all backdrop-blur-sm active:scale-90",children:e.jsx(O,{size:28})})]})]})},se=({isOpen:l,onClose:g,type:b})=>{const{theme:y}=T(),{showToast:c}=G(),[p,r]=s.useState(!1),[n,f]=s.useState(!1),[m,u]=s.useState({name:"",phone:"",message:""}),x=b==="prayer",d=x?"Petición de Oración":"¡Soy Nuevo!",E=x?"Déjanos saber cómo podemos orar por ti. Nuestro equipo estará intercediendo.":"Nos alegra que estés aquí. Déjanos tus datos para conectarnos contigo.",F=async t=>{t.preventDefault(),r(!0);try{await A.post("/requests",{type:x?"prayer":"connect",status:"pending",data:m}),c(x?"Petición enviada con éxito":"¡Gracias por conectarte!","success"),g(),u({name:"",phone:"",message:""}),f(!1)}catch(S){console.error("Error submitting form:",S),c("Hubo un error al enviar tus datos. Intenta nuevamente.","error")}finally{r(!1)}},C={hidden:{opacity:0},visible:{opacity:1}},i={hidden:{y:50,opacity:0,scale:.95},visible:{y:0,opacity:1,scale:1,transition:{type:"spring",bounce:.4}}};return e.jsx(I,{children:l&&e.jsxs("div",{style:{position:"fixed",top:0,left:0,right:0,bottom:0,zIndex:9999,display:"flex",alignItems:"center",justifyContent:"center",padding:"20px"},children:[e.jsx(w.div,{variants:C,initial:"hidden",animate:"visible",exit:"hidden",onClick:g,style:{position:"absolute",top:0,left:0,right:0,bottom:0,backgroundColor:"rgba(18, 12, 31, 0.6)",backdropFilter:"blur(4px)"}}),e.jsxs(w.div,{variants:i,initial:"hidden",animate:"visible",exit:"hidden",style:{position:"relative",backgroundColor:"#FFFFFF",borderRadius:"24px",padding:"40px",width:"100%",maxWidth:"450px",boxShadow:"0 25px 50px -12px rgba(0, 0, 0, 0.25)",zIndex:1},children:[e.jsx("button",{onClick:g,style:{position:"absolute",top:"20px",right:"20px",background:"transparent",border:"none",color:"#120C1F",fontSize:"1.5rem",cursor:"pointer",opacity:.5,transition:"opacity 0.2s"},onMouseOver:t=>t.currentTarget.style.opacity=1,onMouseOut:t=>t.currentTarget.style.opacity=.5,children:e.jsx("i",{className:"bi bi-x-circle-fill"})}),e.jsxs("div",{style:{textAlign:"center",marginBottom:"30px"},children:[e.jsx("div",{style:{width:"60px",height:"60px",borderRadius:"50%",backgroundColor:"rgba(245, 158, 11, 0.1)",color:"#F59E0B",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.8rem",margin:"0 auto 15px auto"},children:e.jsx("i",{className:x?"bi bi-chat-heart":"bi bi-person-heart"})}),e.jsx("h3",{style:{fontFamily:"Moonrising, sans-serif",color:"#120C1F",margin:"0 0 10px 0",fontSize:"1.5rem"},children:d}),e.jsx("p",{style:{color:"#666",fontSize:"0.9rem",margin:0,lineHeight:1.5},children:E})]}),e.jsxs("form",{onSubmit:F,style:{display:"flex",flexDirection:"column",gap:"20px"},children:[e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",marginBottom:"8px",fontSize:"0.85rem",fontWeight:700,color:"#120C1F"},children:"Nombre Completo *"}),e.jsx("input",{type:"text",required:!0,value:m.name,onChange:t=>u({...m,name:t.target.value}),style:{width:"100%",padding:"12px 16px",borderRadius:"12px",border:"1px solid rgba(0,0,0,0.1)",backgroundColor:"#F8F9FC",outline:"none",transition:"all 0.2s",fontSize:"0.95rem"},onFocus:t=>t.target.style.borderColor="#F59E0B",onBlur:t=>t.target.style.borderColor="rgba(0,0,0,0.1)",placeholder:"Escribe tu nombre"})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",marginBottom:"8px",fontSize:"0.85rem",fontWeight:700,color:"#120C1F"},children:"Teléfono / WhatsApp *"}),e.jsx("input",{type:"tel",required:!0,value:m.phone,onChange:t=>u({...m,phone:t.target.value}),style:{width:"100%",padding:"12px 16px",borderRadius:"12px",border:"1px solid rgba(0,0,0,0.1)",backgroundColor:"#F8F9FC",outline:"none",transition:"all 0.2s",fontSize:"0.95rem"},onFocus:t=>t.target.style.borderColor="#F59E0B",onBlur:t=>t.target.style.borderColor="rgba(0,0,0,0.1)",placeholder:"+57 300 000 0000"})]}),e.jsxs("div",{children:[e.jsx("label",{style:{display:"block",marginBottom:"8px",fontSize:"0.85rem",fontWeight:700,color:"#120C1F"},children:x?"¿Cuál es tu petición?":"¿Tienes algún mensaje adicional?"}),e.jsx("textarea",{rows:"3",required:x,value:m.message,onChange:t=>u({...m,message:t.target.value}),style:{width:"100%",padding:"12px 16px",borderRadius:"12px",border:"1px solid rgba(0,0,0,0.1)",backgroundColor:"#F8F9FC",outline:"none",transition:"all 0.2s",fontSize:"0.95rem",resize:"none"},onFocus:t=>t.target.style.borderColor="#F59E0B",onBlur:t=>t.target.style.borderColor="rgba(0,0,0,0.1)",placeholder:x?"Escribe aquí tu petición de oración...":"Comentarios (opcional)"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"flex-start",gap:"10px",marginTop:"5px"},children:[e.jsx("input",{type:"checkbox",id:"termsToggle",checked:n,onChange:t=>f(t.target.checked),style:{marginTop:"3px",cursor:"pointer",accentColor:"#F59E0B",width:"16px",height:"16px"}}),e.jsxs("label",{htmlFor:"termsToggle",style:{fontSize:"0.75rem",color:"#666",lineHeight:1.4,cursor:"pointer"},children:["Autorizo el ",e.jsx("strong",{style:{color:"#120C1F"},children:"tratamiento de mis datos personales"})," para ser contactado de acuerdo con la política de privacidad de la iglesia."]})]}),e.jsx("button",{type:"submit",disabled:p||!n,style:{width:"100%",padding:"14px",borderRadius:"12px",backgroundColor:"#120C1F",color:"#FFF",border:"none",fontWeight:800,fontSize:"1rem",cursor:p?"wait":n?"pointer":"not-allowed",transition:"all 0.2s",marginTop:"10px",opacity:p||!n?.5:1},onMouseOver:t=>!p&&n&&(t.target.style.backgroundColor="#F59E0B"),onMouseOut:t=>!p&&n&&(t.target.style.backgroundColor="#120C1F"),children:p?"Enviando...":x?"Enviar Petición":"Conectarme"})]})]})]})})},re=({settings:l})=>{const g=H(),{isLive:b}=K(),y=s.useRef(null),[c,p]=s.useState(!1),[r,n]=s.useState("prayer"),[f,m]=s.useState(!1),[u,x]=s.useState(!0),d=()=>{if(y.current){const{scrollLeft:h,scrollWidth:j,clientWidth:D}=y.current;m(h>5),x(h<j-D-5)}};s.useEffect(()=>(d(),window.addEventListener("resize",d),()=>window.removeEventListener("resize",d)),[]);const E=h=>{y.current&&y.current.scrollBy({left:h,behavior:"smooth"})},F=h=>{n(h),p(!0)},i=[{id:"diezmos",icon:"bi-wallet2",title:"Diezmos y",subtitle:"Ofrendas",action:()=>window.open("https://alfoliadventista.org/","_blank")},{id:"envivos",icon:"bi-broadcast",title:"En",subtitle:"Vivos",action:()=>g("/tv")},{id:"oracion",icon:"bi-chat-heart",title:"Peticiones de",subtitle:"Oración",action:()=>F("prayer")},{id:"nuevo",icon:"bi-person-heart",title:"Soy",subtitle:"Nuevo",action:()=>F("connect")},{id:"agenda",icon:"bi-calendar-event",title:"Nuestra",subtitle:"Agenda",action:()=>{const h=document.getElementById("calendario")||document.getElementById("novedades");h&&h.scrollIntoView({behavior:"smooth"})}}],t={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{delayChildren:.2,staggerChildren:.1}}},S={hidden:{opacity:0,scale:.8},visible:{opacity:1,scale:1,transition:{type:"spring",stiffness:200}}};return e.jsxs(e.Fragment,{children:[e.jsxs(w.div,{initial:"hidden",animate:"visible",variants:t,style:{width:"100%",maxWidth:"1240px",margin:"30px auto 10px auto",position:"relative",zIndex:10,padding:"0 20px"},children:[f&&e.jsx("button",{onClick:()=>E(-200),style:{position:"absolute",left:"0",top:"50%",transform:"translateY(-50%)",zIndex:20,width:"40px",height:"40px",borderRadius:"50%",background:"#fff",border:"1px solid rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 10px rgba(0,0,0,0.2)",cursor:"pointer"},children:e.jsx(W,{size:24,color:"#120C1F"})}),u&&e.jsx("button",{onClick:()=>E(200),style:{position:"absolute",right:"0",top:"50%",transform:"translateY(-50%)",zIndex:20,width:"40px",height:"40px",borderRadius:"50%",background:"#fff",border:"1px solid rgba(0,0,0,0.1)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 10px rgba(0,0,0,0.2)",cursor:"pointer"},children:e.jsx(O,{size:24,color:"#120C1F"})}),e.jsxs("div",{ref:y,onScroll:d,style:{display:"flex",gap:"15px",flexWrap:"nowrap",overflowX:"auto",paddingBottom:"25px",paddingTop:"10px",scrollbarWidth:"none",msOverflowStyle:"none",WebkitOverflowScrolling:"touch",scrollSnapType:"x mandatory"},className:"dynamic-island-container",children:[e.jsx("style",{children:`
                        .dynamic-island-container::-webkit-scrollbar {
                            display: none;
                        }
                        /* En computador los centramos, en móvil los dejamos fluir a la izquierda para el scroll */
                        @media (min-width: 768px) {
                            .dynamic-island-container {
                                justify-content: center;
                            }
                            .dynamic-island-item {
                                width: 170px !important;
                                height: 130px !important;
                            }
                            .dynamic-island-icon {
                                font-size: 2.5rem !important;
                            }
                            .dynamic-island-text {
                                font-size: 0.95rem !important;
                            }
                        }
                    `}),i.map(h=>{const j=h.id==="envivos"&&b;return e.jsxs(w.div,{className:"dynamic-island-item",variants:S,whileHover:{y:-8,boxShadow:j?"0 20px 40px rgba(255,0,0,0.5)":"0 20px 40px rgba(0,0,0,0.4)"},whileTap:{scale:.95},onClick:h.action,style:{scrollSnapAlign:"center",flex:"0 0 auto",width:"130px",height:"110px",backgroundColor:j?"#FF0000":"#FFFFFF",borderRadius:"24px",border:j?"none":"1px solid rgba(0,0,0,0.05)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"15px 10px",cursor:"pointer",boxShadow:j?"0 10px 25px rgba(255,0,0,0.3)":"0 10px 25px rgba(0,0,0,0.3)",transition:"all 0.3s ease"},children:[e.jsx("div",{className:"dynamic-island-icon",style:{color:j?"#FFFFFF":"#120C1F",fontSize:"1.8rem",marginBottom:"10px",transition:"color 0.3s ease"},onMouseOver:D=>{j||(D.currentTarget.style.color="#F59E0B")},onMouseOut:D=>{j||(D.currentTarget.style.color="#120C1F")},children:e.jsx("i",{className:`bi ${h.icon}`})}),e.jsxs("div",{className:"dynamic-island-text",style:{color:j?"#FFFFFF":"#120C1F",fontSize:"0.8rem",fontWeight:800,textAlign:"center",lineHeight:"1.3"},children:[h.title,e.jsx("br",{}),h.subtitle]})]},h.id)})]})]}),e.jsx(se,{isOpen:c,onClose:()=>p(!1),type:r})]})},ae=3e4,$="oasis:announcements-updated",le="oasis_announcements_updated_at",ce=()=>{const[l,g]=s.useState([]),[b,y]=s.useState(!0),[c,p]=s.useState(null),r=(...i)=>i.find(t=>t!=null&&String(t).trim()!==""),n=s.useMemo(()=>{const i="https://oasis-backend-latest.onrender.com".replace(/\/$/,"");return i.endsWith("/api")?i.slice(0,-4):i},[]),f=i=>{if(!i)return"";if(i.startsWith("http"))return i;const t=i.startsWith("/")?i:`/uploads/${i}`;return`${n}${t}`},m=i=>{let t={};if(i!=null&&i.formData&&typeof i.formData=="string")try{t=JSON.parse(i.formData)}catch{t={}}else i!=null&&i.formData&&typeof i.formData=="object"&&(t=i.formData);let S=r(i==null?void 0:i.title,t==null?void 0:t.title,"ANUNCIO"),h=r(t==null?void 0:t.subtitle,t==null?void 0:t.title2,i==null?void 0:i.subtitle,"");if(S&&typeof S=="string"&&S.includes("|||")){const j=S.split("|||");S=j[0],h=j[1]||h}return{id:i==null?void 0:i.id,tag:r(i==null?void 0:i.tag,t==null?void 0:t.tag,"OASIS"),title:S,subtitle:h,title3:r(t==null?void 0:t.title3,""),speaker:r(t==null?void 0:t.speaker,i==null?void 0:i.speaker,i==null?void 0:i.description,""),content:r(i==null?void 0:i.content,t==null?void 0:t.content,""),date:r(i==null?void 0:i.date,t==null?void 0:t.date,""),time:r(i==null?void 0:i.time,t==null?void 0:t.time,""),location:r(i==null?void 0:i.location,t==null?void 0:t.location,""),image:r(i==null?void 0:i.imageUrl,i==null?void 0:i.image_url,t==null?void 0:t.imageUrl,t==null?void 0:t.bgImage,"")}},u=s.useCallback(async()=>{try{const{data:i}=await A.get("/announcements"),t=Array.isArray(i)?i:(i==null?void 0:i.data)||[];g(t)}catch{g([])}finally{y(!1)}},[]);s.useEffect(()=>{u();const i=window.setInterval(u,ae),t=()=>u(),S=()=>{document.visibilityState==="visible"&&u()},h=j=>{j.key===le&&u()};return window.addEventListener("focus",t),document.addEventListener("visibilitychange",S),window.addEventListener("storage",h),window.addEventListener($,u),()=>{window.clearInterval(i),window.removeEventListener("focus",t),document.removeEventListener("visibilitychange",S),window.removeEventListener("storage",h),window.removeEventListener($,u)}},[u]),s.useEffect(()=>(c?document.body.style.overflow="hidden":document.body.style.overflow="unset",()=>{document.body.style.overflow="unset"}),[c]);const x=s.useMemo(()=>l.find(i=>i.id===c),[c,l]),d=s.useMemo(()=>m(x),[x]),E=s.useMemo(()=>l.findIndex(i=>i.id===c),[l,c]),F=s.useCallback(i=>{if(i&&i.stopPropagation(),l.length>0){const t=(E+1)%l.length;p(l[t].id)}},[E,l]),C=s.useCallback(i=>{if(i&&i.stopPropagation(),l.length>0){const t=(E-1+l.length)%l.length;p(l[t].id)}},[E,l]);return s.useEffect(()=>{const i=t=>{c&&(t.key==="ArrowRight"?F():t.key==="ArrowLeft"?C():t.key==="Escape"&&p(null))};return window.addEventListener("keydown",i),()=>window.removeEventListener("keydown",i)},[c,F,C]),b?e.jsx("div",{style:{color:"white",textAlign:"center",padding:"50px"},children:"Cargando..."}):e.jsxs("div",{style:{position:"relative",width:"100%"},children:[e.jsx("style",{children:`
                .announcement-modal-container {
                    position: relative;
                    width: 96vw;
                    max-width: 1400px;
                    height: 92vh;
                    background: #0a0a0a;
                    border-radius: 32px;
                    display: flex;
                    flex-direction: row;
                    overflow: hidden;
                    box-shadow: 0 40px 100px rgba(0,0,0,0.8);
                }
                .announcement-modal-left {
                    flex: 1 1 50%;
                    height: 100%;
                    position: relative;
                    background: #000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                }
                .announcement-modal-right {
                    flex: 1 1 50%;
                    min-width: 320px;
                    max-width: 520px;
                    padding: 60px 50px;
                    background: #0a0a0a;
                    color: white;
                    border-left: 1px solid rgba(255,255,255,0.08);
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                }
                .announcement-close-btn {
                    position: absolute;
                    top: 25px;
                    left: 25px;
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: white;
                    cursor: pointer;
                    display: grid;
                    place-items: center;
                    backdrop-filter: blur(10px);
                    z-index: 20;
                    transition: background 0.2s;
                }
                .announcement-close-btn:hover {
                    background: rgba(255,255,255,0.2);
                }
                .announcement-title {
                    font-size: 3rem;
                    font-weight: 900;
                    margin: 0 0 10px 0;
                    line-height: 1.1;
                }
                .announcement-subtitle {
                    color: #F59E0B;
                    font-size: 3rem;
                    font-weight: 900;
                    margin: 0 0 20px 0;
                    line-height: 1.1;
                }
                .announcement-info-container {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    justify-content: center;
                    text-align: left;
                    height: 100%;
                    padding-top: 20px;
                }
                .announcement-meta-row {
                    display: flex;
                    gap: 15px;
                    margin-bottom: 20px;
                    align-items: center;
                    justify-content: flex-start;
                    flex-wrap: wrap;
                }
                .announcement-badge {
                    background: #F59E0B;
                    color: black;
                    padding: 6px 14px;
                    border-radius: 10px;
                    font-size: 0.75rem;
                    font-weight: 900;
                    text-transform: uppercase;
                }
                .announcement-meta-item {
                    color: rgba(255,255,255,0.7);
                    font-size: 0.9rem;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                .announcement-speaker {
                    color: #FFFFFF;
                    font-size: 1.2rem;
                    font-weight: 700;
                    margin: 0 0 15px 0;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 8px;
                }
                .announcement-location {
                    color: #F59E0B;
                    font-size: 1.1rem;
                    font-weight: 800;
                    margin: 0 0 20px 0;
                    text-transform: uppercase;
                    letter-spacing: 0.8px;
                    display: flex;
                    align-items: center;
                    justify-content: flex-start;
                    gap: 8px;
                }
                .announcement-content-scroll {
                    overflow-y: auto;
                    color: rgba(255,255,255,0.8);
                    line-height: 1.6;
                    font-size: 1.05rem;
                    max-width: 100%;
                    margin: 0;
                    padding-right: 10px;
                }

                @media (max-width: 992px) {
                    .announcement-modal-container {
                        flex-direction: column;
                        height: 90vh;
                        border-radius: 20px;
                        overflow-y: auto;
                    }
                    .announcement-modal-left {
                        flex: none;
                        width: 100%;
                        height: 40vh;
                        min-height: 250px;
                    }
                    .announcement-modal-right {
                        flex: none;
                        width: 100%;
                        max-width: 100%;
                        height: auto;
                        min-height: 50vh;
                        padding: 40px 25px 30px;
                        border-left: none;
                        border-top: 1px solid rgba(255,255,255,0.08);
                        justify-content: flex-end;
                    }
                    .announcement-title {
                        font-size: 2rem;
                        margin-bottom: 5px;
                    }
                    .announcement-subtitle {
                        font-size: 2rem;
                        margin-bottom: 15px;
                    }
                    .announcement-close-btn {
                        top: 15px;
                        left: 15px;
                        width: 40px;
                        height: 40px;
                    }
                }
                @media (max-width: 768px) {
                    .announcements-grid {
                        grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
                        gap: 12px;
                        padding: 10px;
                    }
                }
            `}),e.jsx("div",{className:"announcements-grid",style:de,children:l.map(i=>{const t=m(i);return e.jsxs(w.div,{layoutId:`card-${i.id}`,onClick:()=>p(i.id),whileHover:{scale:1.02},whileTap:{scale:.98},transition:{type:"spring",stiffness:300,damping:30},style:pe,children:[e.jsx(w.img,{layoutId:`img-${i.id}`,src:f(t.image),style:me}),e.jsxs(w.div,{initial:{opacity:0},animate:{opacity:1},style:xe,children:[e.jsx("span",{style:_,children:t.title}),!!t.subtitle&&e.jsx("span",{style:{..._,fontSize:"0.75rem",color:"#F59E0B"},children:t.subtitle})]})]},i.id)})}),e.jsx(I,{children:c&&x&&e.jsxs("div",{style:ge,children:[e.jsx(w.div,{initial:{opacity:0},animate:{opacity:1},exit:{opacity:0},onClick:()=>p(null),style:ue}),e.jsxs(w.div,{layoutId:`card-${c}`,transition:{type:"spring",stiffness:200,damping:25},className:"announcement-modal-container",children:[e.jsxs("div",{className:"announcement-modal-left",children:[e.jsx(w.img,{layoutId:`img-${c}`,src:f(d.image),style:he}),e.jsx(w.button,{initial:{opacity:0,scale:.5},animate:{opacity:1,scale:1},transition:{delay:.2},onClick:i=>{i.stopPropagation(),p(null)},className:"announcement-close-btn",children:e.jsx(X,{size:24})})]}),e.jsx("div",{className:"announcement-modal-right",children:e.jsx(I,{mode:"wait",children:e.jsxs(w.div,{initial:{opacity:0,x:20},animate:{opacity:1,x:0},exit:{opacity:0,x:-20},transition:{duration:.25,ease:"easeOut"},style:fe,children:[e.jsxs("div",{className:"announcement-info-container",children:[e.jsxs("div",{className:"announcement-meta-row",children:[!!d.tag&&e.jsx("span",{className:"announcement-badge",children:d.tag}),!!d.date&&e.jsxs("span",{className:"announcement-meta-item",children:[e.jsx(q,{size:16,color:"#F59E0B"})," ",d.date]}),!!d.time&&e.jsxs("span",{className:"announcement-meta-item",children:[e.jsx(V,{size:16,color:"#F59E0B"})," ",d.time]})]}),e.jsx("h2",{className:"announcement-title",children:d.title}),!!d.subtitle&&e.jsx("h2",{className:"announcement-subtitle",children:d.subtitle}),!!d.speaker&&e.jsxs("p",{className:"announcement-speaker",children:[e.jsx(Z,{size:18,color:"#F59E0B"})," ",d.speaker]}),!!d.location&&e.jsxs("p",{className:"announcement-location",children:[e.jsx(Y,{size:18,color:"#F59E0B"})," ",d.location]}),e.jsxs("div",{className:"announcement-content-scroll",children:[!!d.title3&&e.jsx("p",{style:be,children:d.title3}),!!d.content&&e.jsx("p",{style:ye,children:d.content})]})]}),e.jsxs("div",{style:ve,children:[e.jsx("button",{onClick:C,style:P,children:e.jsx(W,{size:24})}),e.jsx("button",{onClick:F,style:P,children:e.jsx(O,{size:24})})]})]},c)})})]})]})})]})},de={display:"grid",gridTemplateColumns:"repeat(auto-fill, minmax(240px, 1fr))",gap:"30px",padding:"20px"},pe={position:"relative",width:"100%",aspectRatio:"4 / 5",borderRadius:"24px",overflow:"hidden",cursor:"pointer",background:"#0a0a0a",boxShadow:"0 20px 40px -15px rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center"},me={width:"100%",height:"100%",objectFit:"contain",display:"block"},xe={position:"absolute",bottom:0,left:0,right:0,padding:"30px 20px 20px",background:"linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 50%, transparent 100%)",display:"flex",flexDirection:"column",alignItems:"flex-start",gap:"2px"},_={color:"white",fontWeight:800,fontSize:"0.9rem",textTransform:"uppercase",letterSpacing:"0.5px"},ge={position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",zIndex:99999,padding:"20px"},ue={position:"absolute",inset:0,background:"rgba(0,0,0,0.85)",backdropFilter:"blur(12px)"},he={width:"100%",height:"100%",objectFit:"contain"},fe={height:"100%",display:"flex",flexDirection:"column"},be={color:"rgba(255,255,255,0.75)",fontSize:"1rem",margin:"0 0 10px 0",lineHeight:1.35},ye={color:"rgba(255,255,255,0.7)",lineHeight:1.8,fontSize:"1.1rem"},ve={display:"flex",justifyContent:"flex-end",gap:"15px",paddingTop:"20px",borderTop:"1px solid rgba(255,255,255,0.08)"},P={background:"rgba(255,255,255,0.1)",border:"1px solid rgba(255,255,255,0.2)",color:"white",width:"45px",height:"45px",borderRadius:"50%",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.2s ease"},je=()=>{const{theme:l}=T(),g={deepPurple:"#120C1F",accent:"#F59E0B"};return e.jsxs("div",{style:{height:"100%",display:"flex",flexDirection:"column"},children:[e.jsxs("div",{style:{backgroundColor:"#FFFFFF",height:"100%",display:"flex",flexDirection:"column",boxShadow:"0 20px 50px -10px rgba(0,0,0,0.12)",border:"1px solid rgba(0,0,0,0.03)",transition:"transform 0.3s ease"},className:"map-card-container",children:[e.jsxs("div",{style:{marginBottom:"25px"},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"12px",color:g.accent,marginBottom:"10px"},children:[e.jsx("i",{className:"bi bi-geo-alt-fill",style:{fontSize:"1.2rem"}}),e.jsx("span",{style:{fontWeight:"900",letterSpacing:"3px",fontSize:"0.7rem",textTransform:"uppercase"},children:"Ubicación"})]}),e.jsxs("h3",{style:{fontFamily:"Moonrising, sans-serif",color:g.deepPurple,fontSize:"2rem",margin:0,lineHeight:1.1},children:["Templo ",e.jsx("span",{style:{color:g.accent},children:"Oasis"})]}),e.jsx("p",{style:{color:"#666",marginTop:"10px",fontSize:"0.95rem",fontWeight:"500"},children:"Medellín, Antioquia. Un espacio para ti."})]}),e.jsx("div",{className:"map-iframe-container",style:{flexGrow:1,borderRadius:"24px",overflow:"hidden",background:"#F0F2F5",position:"relative",border:"1px solid rgba(0,0,0,0.05)"},children:e.jsx("iframe",{src:"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.059247738243!2d-75.58983942415124!3d6.255928826210086!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e4428fd37035f8d%3A0xc0c8d9294e5a953e!2sIglesia%20Adventista%20del%20S%C3%A9ptimo%20D%C3%ADa%20-%20Oasis!5e0!3m2!1ses!2sco!4v1713567000000!5m2!1ses!2sco",width:"100%",height:"100%",style:{border:0,filter:"grayscale(0.2) contrast(1.1)"},allowFullScreen:!0,loading:"lazy",referrerPolicy:"no-referrer-when-downgrade",title:"Ubicación Oasis"})}),e.jsx("div",{style:{marginTop:"25px"},children:e.jsx("a",{href:"https://maps.app.goo.gl/9y5H6uU9W2Lz5N1D7",target:"_blank",rel:"noopener noreferrer",style:{textDecoration:"none"},children:e.jsxs("button",{style:{width:"100%",padding:"16px",backgroundColor:g.deepPurple,color:"#FFFFFF",border:"none",borderRadius:"20px",fontWeight:"900",fontSize:"0.8rem",letterSpacing:"2px",textTransform:"uppercase",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"15px",transition:"all 0.3s ease",boxShadow:"0 10px 20px -5px rgba(18, 12, 31, 0.3)"},className:"map-btn",children:["¿Cómo llegar? ",e.jsx("i",{className:"bi bi-arrow-up-right"})]})})})]}),e.jsx("style",{children:`
                .map-card-container {
                    padding: 40px;
                    border-radius: 40px;
                }
                .map-iframe-container {
                    min-height: 350px;
                }
                .map-card-container:hover {
                    transform: translateY(-5px);
                }
                .map-btn:hover {
                    background-color: ${g.accent} !important;
                    color: ${g.deepPurple} !important;
                    transform: translateY(-2px);
                }
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
                @media (max-width: 768px) {
                    .map-card-container {
                        padding: 20px !important;
                        border-radius: 24px !important;
                    }
                    .map-iframe-container {
                        min-height: 250px !important;
                    }
                }
            `})]})},we=3e4,U="oasis:announcements-updated",Fe="oasis_announcements_updated_at",Se=()=>{const{theme:l}=T(),[g,b]=s.useState(new Date),[y,c]=s.useState([]),[p,r]=s.useState(null),n={deepPurple:"#120C1F",midnight:"#08050D",accent:"#F59E0B",softBg:"#F8F9FC",shadow:"rgba(0, 0, 0, 0.12)"},f=(...o)=>o.find(a=>a!=null&&String(a).trim()!==""),m=o=>{if(!o)return null;if(o=o.trim(),/^\d{4}-\d{2}-\d{2}$/.test(o))return o;const a=o.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);if(a)return`${a[3]}-${a[2].padStart(2,"0")}-${a[1].padStart(2,"0")}`;const k=o.toLowerCase().match(/(\d{1,2})\s+de\s+([a-z]+)\s+(?:de|del)\s+(\d{4})/);if(k){const[,v,N,L]=k,z={enero:"01",febrero:"02",marzo:"03",abril:"04",mayo:"05",junio:"06",julio:"07",agosto:"08",septiembre:"09",octubre:"10",noviembre:"11",diciembre:"12"};if(z[N])return`${L}-${z[N]}-${v.padStart(2,"0")}`}return null},u=o=>{let a={};if(o!=null&&o.formData&&typeof o.formData=="string")try{a=JSON.parse(o.formData)}catch{a={}}else o!=null&&o.formData&&typeof o.formData=="object"&&(a=o.formData);if(Object.keys(a).length===0&&(o!=null&&o.content)&&typeof o.content=="string"&&o.content.startsWith("{"))try{a=JSON.parse(o.content)}catch{}const k=f(o==null?void 0:o.date,a==null?void 0:a.date,""),v=m(k)||(o==null?void 0:o.eventDate);return{...o,id:o==null?void 0:o.id,title:f(o==null?void 0:o.title,a==null?void 0:a.title,"Evento"),rawDate:k,date:v,time:f(o==null?void 0:o.time,a==null?void 0:a.time,""),location:f(o==null?void 0:o.location,a==null?void 0:a.location,"")}},x=s.useCallback(()=>{A.get("/announcements").then(({data:o})=>{const k=(Array.isArray(o)?o:(o==null?void 0:o.data)||[]).map(u);c(k.filter(v=>v.date))}).catch(o=>console.error("Calendar Fetch Error:",o))},[]);s.useEffect(()=>{x();const o=window.setInterval(x,we),a=()=>x(),k=()=>{document.visibilityState==="visible"&&x()},v=N=>{N.key===Fe&&x()};return window.addEventListener("focus",a),document.addEventListener("visibilitychange",k),window.addEventListener("storage",v),window.addEventListener(U,x),()=>{window.clearInterval(o),window.removeEventListener("focus",a),document.removeEventListener("visibilitychange",k),window.removeEventListener("storage",v),window.removeEventListener(U,x)}},[x]);const d=(o,a)=>new Date(o,a+1,0).getDate(),E=(o,a)=>{let k=new Date(o,a,1).getDay();return k===0?6:k-1},F=g.getFullYear(),C=g.getMonth(),i=["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"],t=["L","M","M","J","V","S","D"],S=()=>b(new Date(F,C-1,1)),h=()=>b(new Date(F,C+1,1)),j=()=>{const o=[],a=d(F,C),k=E(F,C);for(let v=0;v<k;v++)o.push(e.jsx("div",{style:{padding:"10px"}},`empty-${v}`));for(let v=1;v<=a;v++){const N=`${F}-${String(C+1).padStart(2,"0")}-${String(v).padStart(2,"0")}`,z=y.filter(J=>J.date===N).length>0,R=v===new Date().getDate()&&C===new Date().getMonth()&&F===new Date().getFullYear(),B=p===N;o.push(e.jsxs(w.div,{whileHover:z?{scale:1.1,y:-2}:{},onClick:()=>z&&r(B?null:N),className:"cal-day-box",style:{textAlign:"center",cursor:z?"pointer":"default",borderRadius:"14px",fontWeight:z||R?"800":"500",transition:"all 0.3s ease",position:"relative",backgroundColor:B?n.accent:z?"rgba(245, 158, 11, 0.1)":"transparent",color:B?n.midnight:z?n.accent:n.deepPurple,border:R&&!B?`1.5px solid ${n.accent}`:"1.5px solid transparent"},children:[v,z&&!B&&e.jsx("div",{style:{position:"absolute",bottom:"4px",left:"50%",transform:"translateX(-50%)",width:"4px",height:"4px",borderRadius:"50%",background:n.accent}})]},v))}return o},D=y.filter(o=>o.date===p);return e.jsxs("div",{className:"calendar-card-container",style:{background:"#FFFFFF",height:"100%",display:"flex",flexDirection:"column",boxShadow:`0 20px 50px -10px ${n.shadow}`,border:"1px solid rgba(0,0,0,0.03)"},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"30px"},children:[e.jsxs("div",{children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"8px",color:n.accent,marginBottom:"5px"},children:[e.jsx(q,{size:14}),e.jsx("span",{style:{fontWeight:"900",letterSpacing:"2px",fontSize:"0.6rem",textTransform:"uppercase"},children:"Agenda"})]}),e.jsx("h3",{style:{fontFamily:"Moonrising, sans-serif",color:n.deepPurple,fontSize:"1.8rem",margin:0},children:"Eventos"})]}),e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:"15px",background:n.softBg,padding:"8px 15px",borderRadius:"100px"},children:[e.jsx("button",{onClick:S,className:"cal-nav-btn",children:e.jsx(W,{size:16})}),e.jsx("span",{style:{fontWeight:"800",fontSize:"0.85rem",minWidth:"100px",textAlign:"center",color:n.deepPurple,textTransform:"uppercase"},children:i[C]}),e.jsx("button",{onClick:h,className:"cal-nav-btn",children:e.jsx(O,{size:16})})]})]}),e.jsxs("div",{style:{background:n.softBg,borderRadius:"24px",padding:"20px"},children:[e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:"5px",marginBottom:"15px"},children:t.map((o,a)=>e.jsx("div",{style:{textAlign:"center",fontWeight:"900",color:n.deepPurple,fontSize:"0.65rem",opacity:.4},children:o},a))}),e.jsx("div",{style:{display:"grid",gridTemplateColumns:"repeat(7, 1fr)",gap:"5px"},children:j()})]}),e.jsx("div",{style:{marginTop:"30px",flexGrow:1},children:e.jsx(I,{mode:"wait",children:p?e.jsxs(w.div,{initial:{opacity:0,y:10},animate:{opacity:1,y:0},exit:{opacity:0,y:-10},children:[e.jsx("p",{style:{fontSize:"0.7rem",fontWeight:"900",color:n.accent,textTransform:"uppercase",marginBottom:"15px"},children:"Detalles del día"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:"12px"},children:D.map(o=>e.jsxs("div",{style:{background:n.softBg,padding:"18px",borderRadius:"20px",borderLeft:`4px solid ${n.accent}`,display:"flex",flexDirection:"column",gap:"5px"},children:[e.jsx("span",{style:{color:n.deepPurple,fontWeight:"800",fontSize:"0.95rem"},children:o.title}),e.jsxs("div",{style:{display:"flex",gap:"15px",fontSize:"0.75rem",color:"#666",fontWeight:"600"},children:[e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"5px"},children:[e.jsx(V,{size:12,color:n.accent})," ",o.time||"10:00 AM"]}),e.jsxs("span",{style:{display:"flex",alignItems:"center",gap:"5px"},children:[e.jsx(Y,{size:12,color:n.accent})," ",o.location||"Templo"]})]})]},o.id))})]},p):e.jsxs("div",{style:{textAlign:"center",padding:"30px 0",opacity:.3},children:[e.jsx(ee,{size:40,style:{marginBottom:"10px"}}),e.jsx("p",{style:{fontSize:"0.85rem",fontWeight:"600"},children:"Selecciona un día marcado para ver eventos"})]})})}),e.jsx("style",{children:`
                .calendar-card-container {
                    padding: 40px;
                    border-radius: 40px;
                }
                .cal-day-box {
                    padding: 10px;
                    font-size: 0.85rem;
                }
                .cal-nav-btn {
                    background: none; border: none; color: ${n.deepPurple}; cursor: pointer;
                    display: flex; align-items: center; justify-content: center; transition: 0.2s;
                }
                .cal-nav-btn:hover { color: ${n.accent}; transform: scale(1.2); }
                @font-face {
                    font-family: 'Moonrising';
                    src: url('/fonts/Moonrising.ttf');
                }
                @media (max-width: 768px) {
                    .calendar-card-container {
                        padding: 20px;
                        border-radius: 24px;
                    }
                    .cal-day-box {
                        padding: 6px !important;
                        font-size: 0.75rem !important;
                    }
                }
            `})]})},ke=()=>{const[l,g]=s.useState(0),[b,y]=s.useState({facebook:"https://facebook.com",instagram:"https://instagram.com",youtube:"https://youtube.com",twitter:"https://twitter.com"});s.useEffect(()=>{const n="https://oasis-backend-latest.onrender.com".replace(/\/$/,""),f=n.endsWith("/api")?`${n}/public/settings`:`${n}/api/public/settings`;fetch(f).then(m=>m.json()).then(m=>{y({facebook:m.facebook_url||"https://facebook.com",instagram:m.instagram_url||"https://instagram.com",youtube:m.youtube_url||"https://youtube.com",twitter:m.twitter_url||"https://twitter.com"})}).catch(m=>console.error("Social links load error:",m))},[]);const c={midnight:"#08050D",accent:"#F59E0B"},p=[{title:"Hogares en Paz",text:"Recursos para edificar familias bajo el amor de Dios.",tag:"Familia"},{title:"Juventud Viva",text:"Un espacio dinámico para los que transforman el mundo.",tag:"Liderazgo"},{title:"Comunidad Oasis",text:"No camines solo. Únete a nuestra familia digital.",tag:"Conexión"}];s.useEffect(()=>{const n=setInterval(()=>{g(f=>(f+1)%p.length)},6e3);return()=>clearInterval(n)},[p.length]);const r={background:"rgba(255, 255, 255, 0.04)",backdropFilter:"blur(12px)",borderRadius:"24px",border:"1px solid rgba(255, 255, 255, 0.1)",padding:"20px 24px",display:"flex",alignItems:"center",gap:"16px",transition:"all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",textDecoration:"none",position:"relative"};return e.jsxs(e.Fragment,{children:[e.jsxs("section",{style:{width:"100vw",position:"relative",left:"50%",right:"50%",marginLeft:"-50vw",marginRight:"-50vw",overflow:"hidden",backgroundColor:c.midnight,minHeight:"260px",display:"flex",alignItems:"center",padding:"30px 0"},children:[e.jsx("div",{style:{position:"absolute",inset:0,backgroundImage:'url("https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=90&w=2500&auto=format&fit=crop")',backgroundSize:"cover",backgroundPosition:"center",filter:"brightness(0.2) saturate(0.8)",zIndex:0}}),e.jsx("div",{style:{maxWidth:"1200px",margin:"0 auto",width:"100%",position:"relative",zIndex:10,padding:"0 20px"},children:e.jsxs("div",{className:"social-grid-container",children:[e.jsx("div",{className:"info-container",style:{paddingRight:"20px"},children:e.jsx(I,{mode:"wait",children:e.jsxs(w.div,{initial:{opacity:0,x:-10},animate:{opacity:1,x:0},exit:{opacity:0,x:10},transition:{duration:.5},children:[e.jsx("span",{style:{color:c.accent,fontWeight:"900",letterSpacing:"2px",textTransform:"uppercase",fontSize:"0.6rem"},children:p[l].tag}),e.jsx("h2",{style:{fontFamily:"Moonrising, sans-serif",color:"#fff",fontSize:"1.8rem",margin:"5px 0"},children:p[l].title}),e.jsx("p",{style:{color:"rgba(255,255,255,0.5)",fontSize:"0.8rem",lineHeight:"1.4",marginBottom:"15px"},children:p[l].text})]},l)})}),e.jsx("div",{className:"social-cards-container",style:{display:"contents"},children:[{icon:"Youtube",color:"#FF0000",label:"YouTube",sub:"Transmisiones",link:b.youtube},{icon:"Facebook",color:"#4267B2",label:"Facebook",sub:"Comunidad",link:b.facebook},{icon:"Instagram",color:"#E1306C",label:"Instagram",sub:"Dosis de Fe",link:b.instagram}].map((n,f)=>{const m=te[n.icon];return e.jsxs("a",{href:n.link,target:"_blank",rel:"noreferrer",style:r,className:"social-pill-card",children:[e.jsx("div",{style:{background:`${n.color}15`,padding:"10px",borderRadius:"14px",color:n.color,display:"flex"},className:"social-icon-wrapper",children:e.jsx(m,{size:20,strokeWidth:2.5})}),e.jsxs("div",{style:{flex:1},className:"social-text",children:[e.jsx("h4",{style:{color:"#fff",fontWeight:"800",margin:0,fontSize:"0.85rem"},children:n.label}),e.jsx("p",{style:{color:"rgba(255,255,255,0.4)",fontSize:"0.7rem",margin:0},children:n.sub})]}),e.jsx(ie,{size:14,className:"arrow-small social-arrow"})]},f)})})]})}),e.jsx("style",{children:`
                    .social-pill-card:hover {
                        background: rgba(255, 255, 255, 0.08) !important;
                        transform: translateY(-5px);
                        border-color: rgba(255, 255, 255, 0.2) !important;
                    }
                    .arrow-small { color: ${c.accent}; opacity: 0; transition: 0.3s; }
                    .social-pill-card:hover .arrow-small { opacity: 1; transform: translate(2px, -2px); }

                    .social-grid-container {
                        display: grid;
                        grid-template-columns: 1.2fr 1fr 1fr 1fr;
                        gap: 15px;
                        align-items: center;
                    }

                    @media (max-width: 1024px) {
                        .social-grid-container { grid-template-columns: 1fr 1fr !important; }
                    }
                    @media (max-width: 768px) {
                        .social-grid-container { 
                            display: flex !important;
                            flex-direction: column !important;
                            align-items: center;
                            text-align: center;
                        }
                        .info-container { padding-right: 0 !important; }
                        section { padding: 40px 0 !important; }
                        
                        .social-cards-container {
                            display: flex !important;
                            flex-direction: row;
                            justify-content: center;
                            gap: 15px;
                            margin-top: 10px;
                        }
                        
                        .social-pill-card {
                            padding: 15px !important;
                            justify-content: center;
                            width: auto;
                        }
                        
                        .social-text, .social-arrow {
                            display: none !important;
                        }
                        
                        .social-icon-wrapper {
                            padding: 12px !important;
                        }
                    }
                `})]}),e.jsxs("div",{style:{maxWidth:"1100px",margin:"28px auto 12px auto",padding:"0 16px"},children:[e.jsx("h2",{style:{fontFamily:"Moonrising, sans-serif",color:"#1A2F23",fontWeight:900,fontSize:"2.1rem",marginBottom:"10px",letterSpacing:"1px",textAlign:"center",textShadow:"0 2px 8px #f8fafc88"},children:"¡Visítanos y participa!"}),e.jsx("div",{style:{height:"4px",width:"60px",backgroundColor:"#F59E0B",margin:"0 auto",borderRadius:"10px"}})]})]})},Ce=()=>{const{theme:l}=T(),g=H(),[b,y]=s.useState([]),[c,p]=s.useState(!0);return s.useEffect(()=>{A.get("/event-forms").then(({data:r})=>y((r==null?void 0:r.slice(0,3))||[])).catch(r=>console.error("Error al cargar eventos:",r)).finally(()=>p(!1))},[]),c||b.length===0?null:e.jsxs("section",{id:"eventos-rapidos",style:{padding:"60px 20px",maxWidth:"1240px",margin:"0 auto"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"40px",textAlign:"center"},children:[e.jsx("span",{style:{color:"#F59E0B",fontWeight:"900",textTransform:"uppercase",letterSpacing:"4px",fontSize:"0.7rem",marginBottom:"15px"},children:"Participa"}),e.jsxs("h2",{style:{fontFamily:"Moonrising, sans-serif",color:"#120C1F",fontSize:"clamp(1.8rem, 4vw, 2.5rem)",lineHeight:"1.1",margin:0},children:["Inscripción ",e.jsx("span",{style:{color:"#F59E0B"},children:"Rápida"})]})]}),e.jsx("div",{className:"row g-4 justify-content-center",children:b.map(r=>{var n,f,m;return e.jsx("div",{className:"col-md-6 col-lg-4",children:e.jsx(oe,{style:{height:"100%",cursor:"pointer",transition:"transform 0.3s ease",borderTop:`4px solid ${((n=r.styles)==null?void 0:n.primaryColor)||l.colors.primary}`},onClick:()=>g("/inscripciones"),children:e.jsxs("div",{className:"d-flex flex-column h-100",children:[e.jsx("h4",{className:"fw-bold mb-3",children:r.title}),e.jsx("p",{className:"text-muted small flex-grow-1",style:{display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"},children:r.description}),e.jsxs("div",{className:"mt-3 pt-3 border-top d-flex justify-content-between align-items-center",children:[e.jsx("span",{className:"fw-bold small",style:{color:((f=r.styles)==null?void 0:f.primaryColor)||l.colors.primary},children:"Inscribirme ahora"}),e.jsx("i",{className:"bi bi-chevron-right",style:{color:((m=r.styles)==null?void 0:m.primaryColor)||l.colors.primary}})]})]})})},r.id)})}),e.jsx("div",{className:"text-center mt-5",children:e.jsx("button",{className:"btn rounded-pill px-4 py-2 text-white fw-bold shadow-sm",style:{backgroundColor:"#120C1F",letterSpacing:"1px",fontSize:"0.8rem"},onClick:()=>g("/inscripciones"),children:"VER TODOS LOS EVENTOS"})})]})},at=()=>{const{theme:l}=T(),{isMobile:g}=Q(),[b,y]=s.useState({stream_is_live:!1,youtube_live_video_id:"",youtube_playlist_id:""});return s.useEffect(()=>{A.get("/public/settings").then(({data:c})=>{const p=Array.isArray(c)?c.reduce((r,n)=>({...r,[n.key]:n.value}),{}):c;y(r=>({...r,...p}))}).catch(c=>console.error(c))},[]),e.jsxs("main",{style:{backgroundColor:"#F8F9FC",overflowX:"hidden"},children:[e.jsx(ne,{}),e.jsx(re,{settings:b}),e.jsxs("section",{id:"novedades",style:{padding:"30px 20px",maxWidth:"1240px",margin:"0 auto"},children:[e.jsxs("div",{style:{display:"flex",flexDirection:"column",alignItems:"center",marginBottom:"40px",textAlign:"center"},children:[e.jsx("span",{style:{color:"#F59E0B",fontWeight:"900",textTransform:"uppercase",letterSpacing:"4px",fontSize:"0.7rem",marginBottom:"15px"},children:"Actualidad"}),e.jsxs("h2",{style:{fontFamily:"Moonrising, sans-serif",color:"#120C1F",fontSize:"clamp(2rem, 5vw, 3rem)",lineHeight:"1.1",margin:0},children:["Novedades ",e.jsx("span",{style:{color:"#F59E0B"},children:"Oasis"})]}),e.jsx("div",{style:{height:"4px",width:"40px",backgroundColor:"#F59E0B",marginTop:"20px",borderRadius:"10px",opacity:.3}})]}),e.jsx(ce,{})]}),e.jsx(Ce,{}),e.jsx(ke,{}),e.jsxs("section",{style:{maxWidth:"1240px",margin:"80px auto",padding:"0 20px",display:"grid",gridTemplateColumns:g?"1fr":"1fr 1fr",gap:"40px",alignItems:"stretch"},children:[e.jsx("div",{style:{width:"100%"},children:e.jsx(je,{})}),e.jsx("div",{style:{width:"100%"},children:e.jsx(Se,{})})]}),e.jsx("div",{style:{height:"100px"}})]})};export{at as default};
