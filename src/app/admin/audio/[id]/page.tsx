"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Mic, Upload, Save, ArrowLeft, ArrowUp, ArrowDown, Trash2, CheckCircle, AlertCircle } from "lucide-react";

const API_BASE_URL = "http://localhost:5000";

export default function EditAudioPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [audio, setAudio] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newSegments, setNewSegments] = useState<File[]>([]);
  const [message, setMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  // Recorder state
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  const formattedDuration = useMemo(() => {
    const m = Math.floor(recordingSeconds / 60);
    const s = recordingSeconds % 60;
    return `${m}:${s.toString().padStart(2,'0')}`;
  }, [recordingSeconds]);

  useEffect(() => {
    const fetchAudio = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE_URL}/api/audio/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (!res.ok) throw new Error('Failed to load audio');
        const data = await res.json();
        setAudio(data.audio);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchAudio();
  }, [id]);

  const startRecording = async () => {
    try {
      setMessage(null);
      setRecordingSeconds(0);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = 'audio/webm';
      const mr = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      mr.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setRecordedUrl(url);
        stream.getTracks().forEach(t => t.stop());
        if (timerRef.current) clearInterval(timerRef.current);
      };
      mr.start(1000);
      setIsRecording(true);
      timerRef.current = setInterval(() => setRecordingSeconds(prev => prev + 1), 1000);
    } catch (e) {
      setMessage({ type: 'error', text: 'Microphone access failed' });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addRecordedToList = () => {
    if (!recordedBlob) return;
    const file = new File([recordedBlob], `segment_${Date.now()}.webm`, { type: recordedBlob.type || 'audio/webm' });
    setNewSegments(prev => [...prev, file]);
    if (recordedUrl) URL.revokeObjectURL(recordedUrl);
    setRecordedBlob(null);
    setRecordedUrl(null);
    setRecordingSeconds(0);
  };

  const appendUploads = async () => {
    if (!newSegments.length) return;
    const token = localStorage.getItem('token');
    const form = new FormData();
    newSegments.forEach(f => form.append('segments', f));
    const res = await fetch(`${API_BASE_URL}/api/audio/${id}/segments`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: form
    });
    if (!res.ok) throw new Error('Failed to upload segments');
    setNewSegments([]);
  };

  const moveSegment = async (fromIdx: number, dir: -1 | 1) => {
    if (!audio?.segmentPublicIds?.length) return;
    const ids = [...audio.segmentPublicIds];
    const toIdx = fromIdx + dir;
    if (toIdx < 0 || toIdx >= ids.length) return;
    [ids[toIdx], ids[fromIdx]] = [ids[fromIdx], ids[toIdx]];
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/audio/${id}/segments/order`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ segmentPublicIds: ids })
    });
    if (!res.ok) throw new Error('Reorder failed');
    const data = await res.json();
    setAudio(data.audio);
  };

  const removeSegment = async (publicId: string) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/audio/${id}/segments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ publicId })
    });
    if (!res.ok) throw new Error('Remove failed');
    const data = await res.json();
    setAudio(data.audio);
  };

  const mergeNow = async () => {
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE_URL}/api/audio/${id}/segments/merge`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) throw new Error('Merge failed');
    const data = await res.json();
    setAudio(data.audio);
    setMessage({ type: 'success', text: 'Merged successfully' });
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!audio) return <div className="p-6">Not found</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push('/admin/audio')}>
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-semibold">Edit Audio</h1>
      </div>

      {message && (
        <div className={`p-3 rounded text-sm flex items-center gap-2 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          {message.text}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {audio.title || 'Untitled'}
            {audio.status && <Badge variant="secondary">{String(audio.status)}</Badge>}
          </CardTitle>
          <CardDescription>
            {audio.user ? (
              <>by {audio.user.firstName} {audio.user.lastName}</>
            ) : '—'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="font-medium">Append by Upload</div>
            <input type="file" accept="audio/*" multiple onChange={(e) => {
              const files = e.target.files ? Array.from(e.target.files) : [];
              if (files.length) setNewSegments(prev => [...prev, ...files]);
            }} />
            {newSegments.length > 0 && (
              <div className="text-xs text-gray-600">Pending segments: {newSegments.length}</div>
            )}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={async () => {
                try { await appendUploads(); setMessage({ type: 'success', text: 'Segments uploaded' }); } catch(e) { setMessage({ type: 'error', text: (e as Error).message }); } finally { setTimeout(() => setMessage(null), 2500); }
              }} disabled={!newSegments.length}>Upload Segments</Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium flex items-center gap-2"><Mic className="h-4 w-4" /> Record Segment</div>
            <div className="text-xs text-gray-600">Duration: {formattedDuration}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={isRecording ? stopRecording : startRecording} variant={isRecording ? 'destructive' : 'outline'}>
                {isRecording ? 'Stop' : 'Start'} Recording
              </Button>
              {recordedUrl && (
                <>
                  <Button size="sm" onClick={addRecordedToList}>Add Recorded</Button>
                  <audio controls className="ml-2">
                    <source src={recordedUrl} />
                  </audio>
                </>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-medium">Existing Segments</div>
            {audio.segmentPublicIds && audio.segmentPublicIds.length > 0 ? (
              <div className="space-y-2">
                {audio.segmentPublicIds.map((pid: string, idx: number) => (
                  <div key={pid} className="flex items-center justify-between border rounded p-2 text-sm">
                    <div className="truncate mr-2">{pid}</div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => moveSegment(idx, -1)}><ArrowUp className="h-3 w-3" /></Button>
                      <Button variant="outline" size="sm" onClick={() => moveSegment(idx, 1)}><ArrowDown className="h-3 w-3" /></Button>
                      <Button variant="destructive" size="sm" onClick={() => removeSegment(pid)}><Trash2 className="h-3 w-3" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-gray-500">No segments yet</div>
            )}
          </div>

          <div className="flex gap-2">
            <Button onClick={mergeNow} className="flex items-center gap-1"><Upload className="h-4 w-4" /> Merge into Single File</Button>
            <Button variant="outline" onClick={() => router.push('/admin/audio')} className="flex items-center gap-1"><Save className="h-4 w-4" /> Done</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


