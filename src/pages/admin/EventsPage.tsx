import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, CalendarDays, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import { listEvents, createEvent, updateEvent, deleteEvent, type AdminEvent, type EventInput } from '@/api/events';
import { getApiErrorMessage } from '@/api/errors';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

const emptyForm: EventInput = { name: '', description: '', start_date: '', end_date: '' };
const inputDate = (value: string | null) => value?.slice(0, 10) || '';
const displayDate = (value: string | null) => value
  ? new Date(`${inputDate(value)}T00:00:00`).toLocaleDateString('bs-BA')
  : 'Datum nije postavljen';

export const EventsPage = () => {
  const [events, setEvents] = useState<AdminEvent[]>([]);
  const [form, setForm] = useState<EventInput>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const refresh = async () => {
    setIsLoading(true);
    try {
      setEvents(await listEvents());
      setErrorMessage('');
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Nije moguće učitati događaje.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const startEdit = (event: AdminEvent) => {
    setEditingId(event.eid);
    setForm({
      name: event.name,
      description: event.description || '',
      start_date: inputDate(event.start_date),
      end_date: inputDate(event.end_date),
    });
    setErrorMessage('');
    setSuccessMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      const wasEditing = editingId !== null;
      if (wasEditing) await updateEvent(editingId!, form);
      else await createEvent(form);
      resetForm();
      setSuccessMessage(wasEditing ? 'Događaj je ažuriran.' : 'Događaj je kreiran.');
      await refresh();
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Nije moguće sačuvati događaj.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (event: AdminEvent) => {
    if (!window.confirm(`Obrisati događaj „${event.name}”?`)) return;
    setDeletingId(event.eid);
    setErrorMessage('');
    setSuccessMessage('');
    try {
      await deleteEvent(event.eid);
      if (editingId === event.eid) resetForm();
      setSuccessMessage('Događaj je obrisan.');
      await refresh();
    } catch (err: unknown) {
      setErrorMessage(getApiErrorMessage(err, 'Nije moguće obrisati događaj.'));
    } finally {
      setDeletingId(null);
    }
  };

  const currentEventId = events[0]?.eid;

  return (
    <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-12 py-10 sm:py-12 space-y-6">
      <Button asChild variant="ghost" className="rounded-full gap-2 -ml-3 font-semibold">
        <Link to="/admin"><ArrowLeft className="h-4 w-4" /><span>Nazad na admin panel</span></Link>
      </Button>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">Događaji</h1>
          <p className="text-sm text-muted-foreground mt-1">Godišnji raspored Marša Mira i osnovni podaci događaja.</p>
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={isLoading} className="rounded-full gap-2 self-start">
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Osvježi
        </Button>
      </div>

      <Card className="rounded-3xl border-border p-5 sm:p-7 [--card-spacing:0] space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center"><CalendarDays className="h-5 w-5" /></div>
          <div>
            <h2 className="font-bold text-lg">{editingId === null ? 'Novi događaj' : 'Uredi događaj'}</h2>
            <p className="text-xs text-muted-foreground">Za narednu godinu unesi novi događaj s izmijenjenom godinom.</p>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="space-y-1.5 text-sm font-semibold md:col-span-2">
            Naziv
            <Input required maxLength={150} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Marš Mira 2027" />
          </label>
          <label className="space-y-1.5 text-sm font-semibold md:col-span-2">
            Opis
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Kratak opis događaja" className="w-full rounded-xl border border-input bg-transparent px-4 py-3 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">
            Datum početka
            <Input required type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
          </label>
          <label className="space-y-1.5 text-sm font-semibold">
            Datum kraja
            <Input required type="date" min={form.start_date || undefined} value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} />
          </label>
          <div className="md:col-span-2 flex flex-wrap gap-2 pt-1">
            <Button type="submit" disabled={isSaving} className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingId === null ? <Plus className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editingId === null ? 'Kreiraj događaj' : 'Sačuvaj izmjene'}
            </Button>
            {editingId !== null && <Button type="button" variant="outline" onClick={resetForm} className="rounded-full gap-2"><X className="h-4 w-4" /> Odustani</Button>}
          </div>
        </form>
      </Card>

      {errorMessage && <div className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800"><AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{errorMessage}</span></div>}
      {successMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">{successMessage}</div>}

      <div className="space-y-3">
        {isLoading ? (
          <Card className="rounded-3xl p-12 flex items-center justify-center gap-3 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin text-emerald-600" />Učitavanje događaja...</Card>
        ) : events.length === 0 ? (
          <Card className="rounded-3xl p-12 text-center text-sm text-muted-foreground">Još nema raspisanih događaja.</Card>
        ) : events.map((event) => (
          <Card key={event.eid} className="rounded-3xl border-border p-5 sm:p-6 [--card-spacing:0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="min-w-0 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-bold text-lg">{event.name}</h3>
                {event.eid === currentEventId && <span className="rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">Trenutni događaj</span>}
              </div>
              <p className="text-sm text-muted-foreground">{event.description || 'Bez opisa'}</p>
              <p className="text-xs font-semibold text-muted-foreground">{displayDate(event.start_date)} – {displayDate(event.end_date)}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <Button type="button" variant="outline" onClick={() => startEdit(event)} className="rounded-full gap-2"><Pencil className="h-4 w-4" /> Uredi</Button>
              <Button type="button" variant="destructive" onClick={() => void handleDelete(event)} disabled={deletingId === event.eid} className="rounded-full gap-2">
                {deletingId === event.eid ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Obriši
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Aplikacija za trenutni događaj koristi onaj s najkasnijim datumom početka. Datumi događaja ne mogu se preklapati. Brisanje događaja s učesnicima ili rutom je blokirano radi očuvanja podataka.</p>
    </div>
  );
};
