import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUsuario } from '../services/userService.js';
import { SITE_NAME } from '../data/marketplaceContent.js';
import { getRequestErrorMessage } from '../utils/apiError.js';

const inputClass =
  'mt-2 w-full rounded-full border-0 bg-search-field px-5 py-3 text-sm text-text-primary placeholder:text-text-muted shadow-inner ring-1 ring-inset ring-black/[0.06] focus:outline-none focus:ring-2 focus:ring-cart-badge/35';

export function Registro() {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [email, setEmail] = useState('');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [direccionResidencia, setDireccionResidencia] = useState('');
  const [redSocialTwitter, setRedSocialTwitter] = useState('');
  const [redSocialInstagram, setRedSocialInstagram] = useState('');
  const [telefono, setTelefono] = useState('');
  const [paisResidencia, setPaisResidencia] = useState('Colombia');
  const [ciudadResidencia, setCiudadResidencia] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState('');
  const [tipoPersona, setTipoPersona] = useState('NATURAL');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const passwordTrim = password.trim();
    if (!passwordTrim) {
      setError('La contraseña es obligatoria.');
      return;
    }
    const nom = nombres.trim();
    const ape = apellidos.trim();
    if (!nom || !ape) {
      setError('Nombres y apellidos son obligatorios (caso estudio — comprador).');
      return;
    }
    const doc = documentoIdentidad.trim();
    if (doc.length < 5 || doc.length > 32) {
      setError('Documento de identificación obligatorio: entre 5 y 32 caracteres.');
      return;
    }
    setLoading(true);
    try {
      await createUsuario({
        nombreUsuario,
        email,
        password: passwordTrim,
        nombreCompleto: `${nom} ${ape}`.trim(),
        nombres: nom,
        apellidos: ape,
        direccionResidencia: direccionResidencia.trim() || undefined,
        redSocialTwitter: redSocialTwitter.trim() || undefined,
        redSocialInstagram: redSocialInstagram.trim() || undefined,
        telefono: telefono.trim() || undefined,
        paisResidencia: paisResidencia.trim() || undefined,
        ciudadResidencia: ciudadResidencia.trim() || undefined,
        documentoIdentidad: doc,
        tipoPersona,
      });
      navigate('/login');
    } catch (err) {
      setError(getRequestErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-2 lg:gap-14">
      <div className="hidden flex-col justify-center rounded-2xl border border-border bg-surface p-10 shadow-card lg:flex">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-badge-text">Join {SITE_NAME}</p>
        <h1 className="mt-4 font-sans text-4xl font-bold tracking-tight text-text-primary md:text-5xl">Create your account</h1>
        <p className="mt-4 text-lead text-text-secondary">One account for checkout, orders, and seller tools.</p>
      </div>

      <div>
        <div className="lg:hidden">
          <h1 className="font-sans text-3xl font-bold tracking-tight text-text-primary">Create account</h1>
          <p className="mt-2 text-sm text-text-secondary">Register with the user service API.</p>
        </div>
        <div className="hidden lg:block">
          <h2 className="font-sans text-3xl font-bold tracking-tight text-text-primary">Sign up</h2>
          <p className="mt-2 text-sm text-text-secondary">Fill in your details to get started.</p>
        </div>

        <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border border-border bg-surface p-8 shadow-card">
          {error && (
            <div className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>
          )}
          <div>
            <label className="text-sm font-medium text-text-primary">Username</label>
            <input className={inputClass} value={nombreUsuario} onChange={(e) => setNombreUsuario(e.target.value)} minLength={3} required />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Email</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Password</label>
            <input
              type="password"
              autoComplete="new-password"
              className={inputClass}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-primary">Nombres</label>
              <input className={inputClass} value={nombres} onChange={(e) => setNombres(e.target.value)} required />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Apellidos</label>
              <input className={inputClass} value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Dirección de residencia</label>
            <input
              className={inputClass}
              value={direccionResidencia}
              onChange={(e) => setDireccionResidencia(e.target.value)}
              placeholder="Calle, número, barrio"
            />
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-primary">Twitter</label>
              <input className={inputClass} value={redSocialTwitter} onChange={(e) => setRedSocialTwitter(e.target.value)} placeholder="@usuario" />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Instagram</label>
              <input className={inputClass} value={redSocialInstagram} onChange={(e) => setRedSocialInstagram(e.target.value)} placeholder="@usuario" />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-text-primary">Teléfono</label>
              <input
                className={inputClass}
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+57 300 0000000"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Tipo de persona</label>
              <select
                className={`${inputClass} appearance-none`}
                value={tipoPersona}
                onChange={(e) => setTipoPersona(e.target.value)}
              >
                <option value="NATURAL">Natural</option>
                <option value="JURIDICA">Jurídica</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">País</label>
              <input className={inputClass} value={paisResidencia} onChange={(e) => setPaisResidencia(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">Ciudad</label>
              <input className={inputClass} value={ciudadResidencia} onChange={(e) => setCiudadResidencia(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-text-primary">Documento de identidad (cédula o NIT)</label>
            <input
              className={inputClass}
              value={documentoIdentidad}
              onChange={(e) => setDocumentoIdentidad(e.target.value)}
              maxLength={32}
              minLength={5}
              required
              placeholder="Entre 5 y 32 caracteres"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-black py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-black/90 disabled:opacity-50"
          >
            {loading ? 'Creating…' : 'Create account'}
          </button>
          <p className="text-center text-sm text-text-secondary">
            Already have an account?{' '}
            <Link className="font-semibold text-cart-badge hover:underline" to="/login">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
