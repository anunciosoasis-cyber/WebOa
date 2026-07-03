import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import apiClient from '../api/client';
import { useTheme } from '../react-ui/ThemeContext';
import { useToast } from '../react-ui/components/Toast';
import GlassCard from '../react-ui/components/GlassCard';
import {
    FileText, Save, RotateCcw, Eye, EyeOff,
    RefreshCcw, Copy, Check, Info, Image, Trash2, Mail,
} from 'lucide-react';
import imageCompression from 'browser-image-compression';

const OASIS_COLORS = {
    deepPurple: '#120C1F',
    midnight:   '#08050D',
    accent:     '#F59E0B',
    glassWhite: 'rgba(255,255,255,0.03)',
    glassBorder:'rgba(255,255,255,0.08)',
    success:    '#10B981',
    error:      '#EF4444',
};

const DEFAULT_TEMPLATE =
`\u{1F4E9} Nueva Solicitud \u2014 {{iglesia}}

\u{1F4CB} Categor\u00EDa: {{categoria}}
\u{1F464} Solicitante: {{nombre}}
\u{1F4DE} Tel\u00E9fono: {{telefono}}
\u2709\uFE0F  Email: {{email_solicitante}}

\u{1F4DD} Descripci\u00F3n:
{{descripcion}}

\u{1F4AC} Notas del administrador:
{{notas}}

\u23F0 Recibido: {{fecha}}
\u{1F517} Gestionalo en: {{url}}`;

const SAMPLE_VARS = {
    id:                '42',
    iglesia:           'Iglesia Adventista Oasis',
    categoria:         'Oraci\u00F3n',
    nombre:            'Mar\u00EDa Rodr\u00EDguez',
    telefono:          '+57 300 123 4567',
    email_solicitante: 'maria@correo.com',
    descripcion:       'Por favor oren por mi familia, especialmente por mi hijo que est\u00E1 enfermo y necesita un milagro.',
    notas:             'Contactar antes del s\u00E1bado.',
    fecha:             new Date().toLocaleString('es-ES'),
    url:               'https://oasis.app/admin/solicitudes',
};

const VARIABLES = [
    { key: '{{id}}',                desc: 'N\u00FAmero de solicitud' },
    { key: '{{iglesia}}',           desc: 'Nombre de la iglesia' },
    { key: '{{categoria}}',         desc: 'Tipo de solicitud' },
    { key: '{{nombre}}',            desc: 'Nombre del solicitante' },
    { key: '{{telefono}}',          desc: 'Tel\u00E9fono de contacto' },
    { key: '{{email_solicitante}}', desc: 'Email de contacto' },
    { key: '{{descripcion}}',       desc: 'Descripci\u00F3n completa' },
    { key: '{{notas}}',             desc: 'Notas del administrador' },
    { key: '{{fecha}}',             desc: 'Fecha y hora de recepci\u00F3n' },
    { key: '{{url}}',               desc: 'Enlace al panel admin' },
];

function applyVars(template, vars) {
    return template.replace(/\{\{(\w+)\}\}/g, (_, k) => vars[k] ?? `{{${k}}}`);
}

function escHtml(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

function buildEmailHtml(headerImage, headerTitle, bodyText, footerImage, footerText, vars = null) {
    const resolvedBody = vars ? applyVars(bodyText, vars) : bodyText;

    const bodyRows = resolvedBody
        .split('\n')
        .map(line =>
            line.trim()
                ? `<tr><td style="padding:3px 0;font-size:15px;line-height:1.75;color:#1a1a1a;font-family:Arial,Helvetica,sans-serif;">${escHtml(line)}</td></tr>`
                : '<tr><td style="height:10px;line-height:10px;font-size:1px;">&nbsp;</td></tr>'
        )
        .join('');

    const hasDecorativeParts = headerImage || headerTitle || footerImage || footerText;

    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
</head>
<body style="margin:0;padding:0;background-color:#f0f0f0;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f0f0f0;">
  <tr>
    <td align="center" style="padding:24px 12px;">
      <table width="600" cellpadding="0" cellspacing="0" border="0"
             style="max-width:600px;width:100%;background-color:#ffffff;border-radius:12px;overflow:hidden;">

        ${headerImage ? `
        <tr>
          <td style="padding:0;line-height:0;font-size:0;">
            <img src="${headerImage}" alt="" width="600"
                 style="display:block;width:100%;max-width:600px;height:auto;max-height:220px;object-fit:cover;border-radius:12px 12px 0 0;" />
          </td>
        </tr>` : ''}

        ${headerTitle ? `
        <tr>
          <td bgcolor="#120C1F" style="background-color:#120C1F;padding:18px 40px;text-align:center;">
            <h2 style="margin:0;color:#F59E0B;font-size:18px;font-weight:bold;letter-spacing:2px;font-family:Arial,Helvetica,sans-serif;">
              ${escHtml(headerTitle)}
            </h2>
          </td>
        </tr>` : (!headerImage && hasDecorativeParts ? `
        <tr>
          <td bgcolor="#120C1F" style="background-color:#120C1F;padding:14px 40px;text-align:center;">
            <p style="margin:0;color:rgba(245,158,11,0.8);font-size:10px;font-weight:bold;letter-spacing:4px;font-family:Arial,sans-serif;">
              NOTIFICACI\u00D3N DE SOLICITUD
            </p>
          </td>
        </tr>` : '')}

        <tr>
          <td style="padding:36px 40px;background-color:#ffffff;">
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              ${bodyRows}
            </table>
          </td>
        </tr>

        ${footerImage ? `
        <tr>
          <td style="padding:0;line-height:0;font-size:0;">
            <img src="${footerImage}" alt="" width="600"
                 style="display:block;width:100%;max-width:600px;height:auto;max-height:140px;object-fit:cover;" />
          </td>
        </tr>` : ''}

        ${footerText ? `
        <tr>
          <td bgcolor="#08050D" style="background-color:#08050D;padding:18px 40px;text-align:center;${!footerImage ? 'border-radius:0 0 12px 12px;' : ''}">
            <p style="margin:0;color:rgba(255,255,255,0.45);font-size:12px;line-height:1.6;font-family:Arial,Helvetica,sans-serif;">
              ${escHtml(footerText)}
            </p>
          </td>
        </tr>` : (hasDecorativeParts ? `
        <tr>
          <td bgcolor="#08050D" style="background-color:#08050D;height:6px;border-radius:0 0 12px 12px;"></td>
        </tr>` : '')}

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

// \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500

const AdminEmailTemplate = () => {
    const { mode } = useTheme();
    const isDark = mode === 'dark';
    const { showToast } = useToast();

    const [template,     setTemplate]     = useState(DEFAULT_TEMPLATE);
    const [headerImage,  setHeaderImage]  = useState('');
    const [headerTitle,  setHeaderTitle]  = useState('');
    const [footerImage,  setFooterImage]  = useState('');
    const [footerText,   setFooterText]   = useState('');
    const [activeTab,    setActiveTab]    = useState('body');
    const [showPreview,  setShowPreview]  = useState(true);
    const [loading,      setLoading]      = useState(true);
    const [saving,       setSaving]       = useState(false);
    const [copied,       setCopied]       = useState(null);
    const [copiedHtml,   setCopiedHtml]   = useState(false);

    const headerInputRef = useRef();
    const footerInputRef = useRef();

    useEffect(() => {
        (async () => {
            try {
                const { data } = await apiClient.get('/settings');
                const map = Array.isArray(data)
                    ? data.reduce((a, s) => ({ ...a, [s.key]: s.value }), {})
                    : data;
                if (map.email_template_solicitud?.trim()) setTemplate(map.email_template_solicitud);
                if (map.email_header_image?.trim())       setHeaderImage(map.email_header_image);
                if (map.email_header_title?.trim())       setHeaderTitle(map.email_header_title);
                if (map.email_footer_image?.trim())       setFooterImage(map.email_footer_image);
                if (map.email_footer_text?.trim())        setFooterText(map.email_footer_text);
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    const previewHtml = useMemo(
        () => buildEmailHtml(headerImage, headerTitle, template, footerImage, footerText, SAMPLE_VARS),
        [headerImage, headerTitle, template, footerImage, footerText]
    );

    const handleSave = async () => {
        setSaving(true);
        try {
            await apiClient.post('/settings', {
                email_template_solicitud: template,
                email_header_image:       headerImage,
                email_header_title:       headerTitle,
                email_footer_image:       footerImage,
                email_footer_text:        footerText,
            });
            showToast('Plantilla guardada correctamente', 'success');
        } catch {
            showToast('Error al guardar la plantilla', 'error');
        } finally { setSaving(false); }
    };

    const handleRestore = () => {
        setTemplate(DEFAULT_TEMPLATE);
        showToast('Cuerpo del correo restaurado al valor original', 'success');
    };

    const handleCopyHtml = async () => {
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    'text/html':  new Blob([previewHtml], { type: 'text/html' }),
                    'text/plain': new Blob([applyVars(template, SAMPLE_VARS)], { type: 'text/plain' }),
                }),
            ]);
            setCopiedHtml(true);
            setTimeout(() => setCopiedHtml(false), 2500);
            showToast('HTML copiado \u2014 p\u00E9galo en Gmail Compose o Outlook para usar como plantilla', 'success');
        } catch {
            showToast('No se pudo acceder al portapapeles. Prueba en Chrome o Edge.', 'error');
        }
    };

    const handleImageUpload = (setter) => async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        
        try {
            showToast('Comprimiendo y subiendo imagen...', 'info');
            
            const compressedFile = await imageCompression(file, {
                maxSizeMB: 0.9,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
                initialQuality: 0.8
            });

            const formData = new FormData();
            formData.append('file', compressedFile, file.name);
            const res = await apiClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data && res.data.url) {
                setter(res.data.url);
                showToast('Imagen subida correctamente', 'success');
            } else {
                throw new Error(res.data?.message || 'No URL returned');
            }
        } catch (err) {
            console.error('Upload Error:', err);
            showToast(`Error: ${err.message}`, 'error');
        } finally {
            e.target.value = '';
        }
    };

    const insertVar = useCallback((varKey) => {
        const ta = document.getElementById('email-template-editor');
        if (!ta) return;
        const start = ta.selectionStart;
        const end   = ta.selectionEnd;
        setTemplate(prev => prev.slice(0, start) + varKey + prev.slice(end));
        setTimeout(() => {
            ta.selectionStart = ta.selectionEnd = start + varKey.length;
            ta.focus();
        }, 0);
    }, []);

    const handleCopyVar = (varKey) => {
        navigator.clipboard?.writeText(varKey);
        setCopied(varKey);
        setTimeout(() => setCopied(null), 1500);
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100"
            style={{ background: isDark ? OASIS_COLORS.midnight : '#F9FAFB' }}>
            <div className="spinner-border" style={{ color: OASIS_COLORS.accent }} role="status" />
        </div>
    );

    const surface  = isDark ? OASIS_COLORS.glassWhite  : 'rgba(18,12,31,0.04)';
    const border   = isDark ? OASIS_COLORS.glassBorder  : 'rgba(18,12,31,0.1)';
    const textMain = isDark ? '#FFFFFF'                 : OASIS_COLORS.deepPurple;
    const textMute = isDark ? 'rgba(255,255,255,0.45)'  : '#64748B';

    const inputStyle = {
        width: '100%',
        background: isDark ? 'rgba(0,0,0,0.3)' : '#fff',
        border: `1px solid ${border}`,
        borderRadius: '12px',
        padding: '12px 16px',
        color: textMain,
        fontSize: '0.85rem',
        outline: 'none',
        fontFamily: 'inherit',
        transition: 'border-color 0.2s',
    };

    const labelStyle = {
        fontSize: '0.62rem',
        fontWeight: 900,
        color: textMute,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        display: 'block',
        marginBottom: '10px',
    };

    const btnGhost = {
        background: surface,
        border: `1px solid ${border}`,
        borderRadius: '50px',
        padding: '8px 18px',
        color: textMute,
        cursor: 'pointer',
        fontSize: '0.7rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        letterSpacing: '0.5px',
    };

    const btnDanger = {
        background: 'rgba(239,68,68,0.08)',
        border: '1px solid rgba(239,68,68,0.25)',
        borderRadius: '50px',
        padding: '8px 18px',
        color: OASIS_COLORS.error,
        cursor: 'pointer',
        fontSize: '0.7rem',
        fontWeight: 700,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
    };

    const ImageUploadZone = ({ src, maxHeight, onClick }) => (
        <div
            style={{
                borderRadius: '16px',
                overflow: 'hidden',
                border: src ? `1px solid ${border}` : `2px dashed ${border}`,
                background: src ? 'none' : surface,
                minHeight: maxHeight ?? 140,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: src ? 'default' : 'pointer',
                transition: 'border-color 0.2s',
            }}
            onClick={() => !src && onClick?.()}
        >
            {src ? (
                <img src={src} alt=""
                    style={{ width: '100%', maxHeight: maxHeight ?? 140, objectFit: 'cover', display: 'block' }} />
            ) : (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                    <Image size={30} style={{ color: textMute, display: 'block', margin: '0 auto 10px', opacity: 0.5 }} />
                    <p style={{ color: textMute, fontSize: '0.75rem', margin: 0 }}>Clic para subir imagen</p>
                    <p style={{ color: textMute, fontSize: '0.62rem', margin: '4px 0 0', opacity: 0.55 }}>PNG \u00B7 JPG \u00B7 WebP \u2014 m\u00E1x. 2 MB</p>
                    <p style={{ color: textMute, fontSize: '0.6rem', margin: '3px 0 0', opacity: 0.45 }}>Se convierte a Base64 y queda embebida</p>
                </div>
            )}
        </div>
    );

    return (
        <div className="container-fluid pb-5"
            style={{ background: isDark ? OASIS_COLORS.midnight : '#F9FAFB', minHeight: '100vh', padding: '40px' }}>

            <header className="mb-5 d-flex justify-content-between align-items-end flex-wrap gap-3">
                <div>
                    <span style={{ color: OASIS_COLORS.accent, fontWeight: 900, fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '4px' }}>
                        Comunicaciones
                    </span>
                    <h1 style={{ fontFamily: 'Moonrising', fontSize: '2.5rem', margin: '5px 0 0', color: textMain }}>
                        PLANTILLA DE <span style={{ color: OASIS_COLORS.accent }}>CORREO</span>
                    </h1>
                    <p style={{ color: textMute, fontSize: '0.85rem', marginTop: '6px' }}>
                        Dise\u00F1a el correo completo \u2014 cabecera con imagen, cuerpo personalizable y pie de p\u00E1gina.
                        Las im\u00E1genes se embeben en Base64 para compatibilidad con Outlook y Gmail.
                    </p>
                </div>
                <div className="d-flex gap-2 flex-wrap">
                    {activeTab === 'body' && (
                        <button onClick={handleRestore} style={btnGhost}>
                            <RotateCcw size={14} /> RESTAURAR
                        </button>
                    )}
                    <button onClick={() => setShowPreview(p => !p)}
                        style={{ ...btnGhost, color: showPreview ? OASIS_COLORS.accent : textMute, borderColor: showPreview ? 'rgba(245,158,11,0.35)' : border }}>
                        {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
                        {showPreview ? 'OCULTAR PREVIEW' : 'VER PREVIEW'}
                    </button>
                    <button onClick={handleSave} disabled={saving}
                        style={{ background: OASIS_COLORS.accent, border: 'none', borderRadius: '50px', padding: '12px 28px', color: '#000', cursor: 'pointer', fontWeight: 900, fontSize: '0.8rem', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px', opacity: saving ? 0.7 : 1, transition: 'opacity 0.2s' }}>
                        {saving
                            ? <RefreshCcw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Save size={16} />}
                        {saving ? 'GUARDANDO...' : 'GUARDAR PLANTILLA'}
                    </button>
                </div>
            </header>

            <div className="row g-4">

                <div className={showPreview ? 'col-xl-5 col-lg-6' : 'col-12'}>
                    <GlassCard style={{ padding: '32px', borderRadius: '28px', border: `1px solid ${border}`, minHeight: '620px' }}>

                        <div className="d-flex gap-1 mb-4"
                            style={{ background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(18,12,31,0.06)', borderRadius: '50px', padding: '4px', width: 'fit-content' }}>
                            {[
                                { key: 'body',   label: 'CUERPO',   Icon: FileText },
                                { key: 'header', label: 'CABECERA', Icon: Image },
                                { key: 'footer', label: 'PIE',      Icon: Mail },
                            ].map(({ key, label, Icon }) => (
                                <button key={key} onClick={() => setActiveTab(key)}
                                    style={{
                                        background:    activeTab === key ? OASIS_COLORS.accent : 'transparent',
                                        border:        'none',
                                        borderRadius:  '50px',
                                        padding:       '9px 20px',
                                        color:         activeTab === key ? '#000' : textMute,
                                        cursor:        'pointer',
                                        fontSize:      '0.68rem',
                                        fontWeight:    900,
                                        letterSpacing: '1.5px',
                                        display:       'flex',
                                        alignItems:    'center',
                                        gap:           '6px',
                                        transition:    'all 0.2s',
                                    }}>
                                    <Icon size={12} /> {label}
                                </button>
                            ))}
                        </div>

                        {/* TAB: CUERPO */}
                        {activeTab === 'body' && (
                            <>
                                <div className="mb-3 d-flex flex-wrap gap-2 align-items-center"
                                    style={{ background: isDark ? 'rgba(245,158,11,0.03)' : 'rgba(245,158,11,0.04)', borderRadius: '12px', padding: '10px 14px', border: '1px solid rgba(245,158,11,0.1)' }}>
                                    <span style={{ fontSize: '0.58rem', fontWeight: 900, color: OASIS_COLORS.accent, textTransform: 'uppercase', letterSpacing: '2px', marginRight: '4px', whiteSpace: 'nowrap' }}>
                                        <Info size={11} style={{ verticalAlign: 'middle', marginRight: 3 }} />
                                        Insertar variable:
                                    </span>
                                    {VARIABLES.map(({ key, desc }) => (
                                        <button key={key} title={desc}
                                            onClick={() => insertVar(key)}
                                            style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '8px', padding: '3px 10px', color: OASIS_COLORS.accent, cursor: 'pointer', fontSize: '0.65rem', fontFamily: 'monospace', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', userSelect: 'none' }}>
                                            {key}
                                            {copied === key
                                                ? <Check size={10} />
                                                : <Copy size={10} style={{ opacity: 0.5 }} onClick={e => { e.stopPropagation(); handleCopyVar(key); }} />
                                            }
                                        </button>
                                    ))}
                                </div>
                                <div className="d-flex justify-content-end mb-2">
                                    <span style={{ fontSize: '0.6rem', color: textMute }}>
                                        {template.length} caracteres \u00B7 {template.split('\n').length} l\u00EDneas
                                    </span>
                                </div>
                                <textarea
                                    id="email-template-editor"
                                    value={template}
                                    onChange={e => setTemplate(e.target.value)}
                                    spellCheck={false}
                                    style={{
                                        width: '100%',
                                        minHeight: '460px',
                                        background: isDark ? 'rgba(0,0,0,0.4)' : '#fff',
                                        border: `1px solid ${border}`,
                                        borderRadius: '16px',
                                        padding: '20px',
                                        color: textMain,
                                        fontFamily: '"Courier New", Courier, monospace',
                                        fontSize: '0.85rem',
                                        lineHeight: '1.75',
                                        resize: 'vertical',
                                        outline: 'none',
                                        caretColor: OASIS_COLORS.accent,
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={e  => e.target.style.borderColor = OASIS_COLORS.accent}
                                    onBlur={e   => e.target.style.borderColor = border}
                                />
                            </>
                        )}

                        {/* TAB: CABECERA */}
                        {activeTab === 'header' && (
                            <div className="row g-4">
                                <div className="col-12">
                                    <label style={labelStyle}>Imagen de cabecera</label>
                                    <ImageUploadZone
                                        src={headerImage}
                                        maxHeight={200}
                                        onClick={() => headerInputRef.current?.click()}
                                    />
                                    <input ref={headerInputRef} type="file" accept="image/*" hidden
                                        onChange={handleImageUpload(setHeaderImage)} />
                                    <div className="d-flex gap-2 mt-3 flex-wrap">
                                        <button style={btnGhost} onClick={() => headerInputRef.current?.click()}>
                                            <Image size={13} /> {headerImage ? 'CAMBIAR IMAGEN' : 'SUBIR IMAGEN'}
                                        </button>
                                        {headerImage && (
                                            <button style={btnDanger} onClick={() => {
                                                setHeaderImage('');
                                                if (headerInputRef.current) headerInputRef.current.value = '';
                                            }}>
                                                <Trash2 size={13} /> ELIMINAR
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label style={labelStyle}>
                                        T\u00EDtulo del banner&nbsp;
                                        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.55 }}>(opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={headerTitle}
                                        onChange={e => setHeaderTitle(e.target.value)}
                                        placeholder="Ej: NUEVA SOLICITUD RECIBIDA"
                                        style={inputStyle}
                                        onFocus={e  => e.target.style.borderColor = OASIS_COLORS.accent}
                                        onBlur={e   => e.target.style.borderColor = border}
                                    />
                                    <p style={{ fontSize: '0.62rem', color: textMute, marginTop: '7px', opacity: 0.7 }}>
                                        Aparece en un banner oscuro debajo de la imagen, con letras en dorado.
                                    </p>
                                </div>
                                {(headerImage || headerTitle) && (
                                    <div className="col-12">
                                        <label style={labelStyle}>Vista previa de cabecera</label>
                                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${border}` }}>
                                            {headerImage && (
                                                <img src={headerImage} alt="" style={{ width: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' }} />
                                            )}
                                            {headerTitle && (
                                                <div style={{ background: '#120C1F', padding: '12px 24px', textAlign: 'center' }}>
                                                    <span style={{ color: '#F59E0B', fontWeight: 900, fontSize: '0.85rem', letterSpacing: '2px' }}>
                                                        {headerTitle}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* TAB: PIE */}
                        {activeTab === 'footer' && (
                            <div className="row g-4">
                                <div className="col-12">
                                    <label style={labelStyle}>Imagen de pie de p\u00E1gina</label>
                                    <ImageUploadZone
                                        src={footerImage}
                                        maxHeight={130}
                                        onClick={() => footerInputRef.current?.click()}
                                    />
                                    <input ref={footerInputRef} type="file" accept="image/*" hidden
                                        onChange={handleImageUpload(setFooterImage)} />
                                    <div className="d-flex gap-2 mt-3 flex-wrap">
                                        <button style={btnGhost} onClick={() => footerInputRef.current?.click()}>
                                            <Image size={13} /> {footerImage ? 'CAMBIAR IMAGEN' : 'SUBIR IMAGEN'}
                                        </button>
                                        {footerImage && (
                                            <button style={btnDanger} onClick={() => {
                                                setFooterImage('');
                                                if (footerInputRef.current) footerInputRef.current.value = '';
                                            }}>
                                                <Trash2 size={13} /> ELIMINAR
                                            </button>
                                        )}
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label style={labelStyle}>
                                        Texto del pie&nbsp;
                                        <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, opacity: 0.55 }}>(opcional)</span>
                                    </label>
                                    <textarea
                                        value={footerText}
                                        onChange={e => setFooterText(e.target.value)}
                                        rows={3}
                                        placeholder="Ej: Iglesia Adventista Oasis \u2014 Este es un mensaje autom\u00E1tico, no respondas."
                                        style={{ ...inputStyle, resize: 'vertical' }}
                                        onFocus={e  => e.target.style.borderColor = OASIS_COLORS.accent}
                                        onBlur={e   => e.target.style.borderColor = border}
                                    />
                                    <p style={{ fontSize: '0.62rem', color: textMute, marginTop: '7px', opacity: 0.7 }}>
                                        Se muestra en un banner oscuro al pie del correo.
                                    </p>
                                </div>
                                {(footerImage || footerText) && (
                                    <div className="col-12">
                                        <label style={labelStyle}>Vista previa de pie</label>
                                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: `1px solid ${border}` }}>
                                            {footerImage && (
                                                <img src={footerImage} alt="" style={{ width: '100%', maxHeight: '100px', objectFit: 'cover', display: 'block' }} />
                                            )}
                                            {footerText && (
                                                <div style={{ background: '#08050D', padding: '12px 24px', textAlign: 'center' }}>
                                                    <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.72rem' }}>
                                                        {footerText}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </GlassCard>
                </div>

                {/* Vista Previa */}
                {showPreview && (
                    <div className="col-xl-7 col-lg-6">
                        <GlassCard style={{ padding: '32px', borderRadius: '28px', border: `1px solid ${border}` }}>
                            <div className="d-flex align-items-center gap-2 mb-3 flex-wrap">
                                <Eye size={15} style={{ color: OASIS_COLORS.success }} />
                                <span style={{ fontSize: '0.62rem', fontWeight: 900, color: OASIS_COLORS.success, textTransform: 'uppercase', letterSpacing: '3px' }}>
                                    Vista Previa
                                </span>
                                <span style={{ fontSize: '0.62rem', color: textMute, fontStyle: 'italic' }}>
                                    datos de ejemplo
                                </span>
                                <div style={{ marginLeft: 'auto' }}>
                                    <button
                                        onClick={handleCopyHtml}
                                        title="Copia el HTML renderizado \u2014 p\u00E9galo en Gmail Compose o Outlook"
                                        style={{
                                            background:   copiedHtml ? 'rgba(16,185,129,0.12)' : surface,
                                            border:       `1px solid ${copiedHtml ? 'rgba(16,185,129,0.4)' : border}`,
                                            borderRadius: '50px',
                                            padding:      '7px 16px',
                                            color:        copiedHtml ? OASIS_COLORS.success : textMute,
                                            cursor:       'pointer',
                                            fontSize:     '0.65rem',
                                            fontWeight:   900,
                                            letterSpacing:'0.5px',
                                            display:      'flex',
                                            alignItems:   'center',
                                            gap:          '6px',
                                            transition:   'all 0.2s',
                                        }}>
                                        {copiedHtml ? <Check size={12} /> : <Copy size={12} />}
                                        {copiedHtml ? 'COPIADO' : 'COPIAR PARA OUTLOOK / GMAIL'}
                                    </button>
                                </div>
                            </div>

                            <div style={{ background: isDark ? '#1a1025' : '#f8f9fa', borderRadius: '16px', overflow: 'hidden', border: `1px solid ${border}` }}>
                                <div style={{ background: isDark ? '#0d0918' : '#e9ecef', padding: '14px 18px', borderBottom: `1px solid ${border}` }}>
                                    <div style={{ display: 'grid', gap: '5px' }}>
                                        {[
                                            ['De',     'Iglesia Adventista Oasis <oasis@correo.com>', true],
                                            ['Para',   'pastor@iglesia.com', false],
                                            ['Asunto', '[Iglesia Adventista Oasis] \u{1F514} Nueva Solicitud #42 \u2014 Oraci\u00F3n', false],
                                        ].map(([label, value, bold]) => (
                                            <div key={label} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                                                <span style={{ fontSize: '0.6rem', color: textMute, minWidth: '50px', paddingTop: '2px' }}>{label}:</span>
                                                <span style={{ fontSize: '0.72rem', color: label === 'Asunto' ? OASIS_COLORS.accent : textMain, fontWeight: bold || label === 'Asunto' ? 700 : 400, lineHeight: 1.4 }}>
                                                    {value}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <iframe
                                    srcDoc={previewHtml}
                                    style={{ width: '100%', height: '580px', border: 'none', display: 'block', background: '#fff' }}
                                    title="Vista previa del correo"
                                    sandbox="allow-same-origin"
                                />
                            </div>

                            <p style={{ fontSize: '0.6rem', color: textMute, textAlign: 'center', marginTop: '10px', opacity: 0.6 }}>
                                {'💡'} &ldquo;COPIAR PARA OUTLOOK / GMAIL&rdquo; copia el HTML con diseño completo.
                                Abre un nuevo correo → pega (Ctrl+V) → el diseño aparece listo para enviar.
                            </p>
                        </GlassCard>
                    </div>
                )}
            </div>

            {activeTab === 'body' && (
                <div className="mt-4">
                    <GlassCard style={{ padding: '24px 32px', borderRadius: '24px', border: `1px solid ${border}` }}>
                        <span style={{ fontSize: '0.62rem', fontWeight: 900, color: OASIS_COLORS.accent, textTransform: 'uppercase', letterSpacing: '3px' }}>
                            Referencia de variables
                        </span>
                        <div className="row g-2 mt-3">
                            {VARIABLES.map(({ key, desc }) => (
                                <div key={key} className="col-md-4 col-lg-3">
                                    <div style={{ background: surface, border: `1px solid ${border}`, borderRadius: '12px', padding: '9px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <code style={{ color: OASIS_COLORS.accent, fontSize: '0.68rem', fontWeight: 700, background: 'rgba(245,158,11,0.08)', padding: '2px 7px', borderRadius: '6px', whiteSpace: 'nowrap' }}>
                                            {key}
                                        </code>
                                        <span style={{ color: textMute, fontSize: '0.67rem' }}>{desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>
            )}

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AdminEmailTemplate;
