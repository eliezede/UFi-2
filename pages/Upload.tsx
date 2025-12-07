
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '../services/firebase';
import { useTranslation } from 'react-i18next';
import { UploadCloud, Music, Image as ImageIcon, Loader2, X, FileAudio, PlayCircle } from 'lucide-react';

const Upload: React.FC = () => {
  const { t } = useTranslation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Constants
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // Increased to 15MB
  // Explicitly list extensions to fix iOS "Grayed out" files issue
  const ACCEPTED_AUDIO_TYPES = "audio/*,.mp3,.wav,.m4a,.aac,.ogg,.flac";

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const validateAndSetAudio = (file: File) => {
    // 1. Validation Logic
    // We check startsWith('audio/') OR specific extensions because mobile browsers
    // sometimes fail to identify the MIME type correctly from the Files app.
    const isAudioMime = file.type.startsWith('audio/');
    const hasAudioExtension = /\.(mp3|wav|m4a|aac|ogg|flac)$/i.test(file.name);

    if (!isAudioMime && !hasAudioExtension) {
      alert("Please select a valid audio file (MP3, WAV, M4A).");
      return;
    }
    
    // 2. Check Size
    if (file.size > MAX_FILE_SIZE) {
      alert("File is too large. Max size is 15MB.");
      return;
    }

    setAudioFile(file);
    const url = URL.createObjectURL(file);
    setAudioPreview(url);
  };

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.preload = 'metadata';
      audio.onloadedmetadata = () => {
        window.URL.revokeObjectURL(audio.src);
        resolve(audio.duration);
      };
      audio.src = URL.createObjectURL(file);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetAudio(e.dataTransfer.files[0]);
    }
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetAudio(e.target.files[0]);
    }
  };

  const handleCoverSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const removeAudio = () => {
    setAudioFile(null);
    setAudioPreview(null);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !audioFile || !title) return;

    setUploading(true);

    try {
      // 1. Get Duration
      const duration = await getAudioDuration(audioFile);

      // 2. Upload Audio
      const audioRef = ref(storage, `tracks/${currentUser.uid}/${Date.now()}_${audioFile.name}`);
      await uploadBytes(audioRef, audioFile);
      const audioURL = await getDownloadURL(audioRef);

      // 3. Upload Cover (or use default)
      let coverImageURL = "https://picsum.photos/400/400";
      if (coverFile) {
        const coverRef = ref(storage, `covers/${currentUser.uid}/${Date.now()}_${coverFile.name}`);
        await uploadBytes(coverRef, coverFile);
        coverImageURL = await getDownloadURL(coverRef);
      }

      // 4. Save to Firestore
      await addDoc(collection(db, "tracks"), {
        artistId: currentUser.uid,
        artistName: currentUser.displayName || "Anonymous",
        artistPhotoURL: currentUser.photoURL,
        title,
        description,
        genre,
        audioURL,
        coverImageURL,
        tags: description.match(/#[\w]+/g)?.map(x => x.substring(1)) || [],
        createdAt: serverTimestamp(),
        likesCount: 0,
        playsCount: 0,
        duration: duration || 180 
      });

      navigate('/feed');
    } catch (error) {
      console.error("Upload failed", error);
      alert("Upload failed. Please check your connection or try a smaller file.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <h2 className="text-3xl font-bold mb-2">{t('upload.title')}</h2>
      <p className="text-gray-400 mb-8">Share your sound with the world.</p>
      
      <form onSubmit={handleUpload} className="space-y-8">
        
        {/* Audio Input Area */}
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-10 transition-all duration-300 ease-in-out group ${
            isDragging 
              ? 'border-primary bg-primary/10 scale-[1.01]' 
              : audioFile 
                ? 'border-green-500/50 bg-green-500/5'
                : 'border-slate-700 hover:bg-slate-800/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          {audioFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center">
                  <FileAudio size={32} />
                </div>
                <div>
                  <p className="font-bold text-white text-lg">{audioFile.name}</p>
                  <p className="text-sm text-gray-400">{(audioFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  {audioPreview && (
                    <audio controls src={audioPreview} className="h-8 mt-2 w-48 opacity-70" />
                  )}
                </div>
              </div>
              <button 
                type="button" 
                onClick={removeAudio}
                className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center cursor-pointer">
              <input 
                type="file" 
                accept={ACCEPTED_AUDIO_TYPES}
                onChange={handleAudioSelect}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className={`p-5 rounded-full mb-4 transition-transform group-hover:scale-110 ${isDragging ? 'bg-primary text-white' : 'bg-slate-800 text-primary shadow-lg shadow-primary/20'}`}>
                <Music size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {isDragging ? "Drop it here!" : "Drag & Drop your track"}
              </h3>
              <p className="text-gray-400">or click to browse files</p>
              <div className="mt-4 px-3 py-1 bg-slate-800 rounded text-xs font-mono text-gray-500 border border-slate-700">
                MP3, WAV, AAC, M4A (Max 15MB)
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Cover Image Input */}
            <div className="md:col-span-1">
                <div className="border-2 border-dashed border-slate-700 rounded-2xl aspect-square flex flex-col items-center justify-center text-center hover:bg-slate-800/50 transition-colors group relative cursor-pointer overflow-hidden">
                    <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleCoverSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {coverPreview ? (
                        <>
                            <img src={coverPreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="text-white" />
                                <span className="text-white text-xs ml-2">Change</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="p-4 rounded-full mb-3 bg-slate-800 text-gray-400 group-hover:bg-slate-700">
                                <ImageIcon size={24} />
                            </div>
                            <p className="font-medium text-gray-400 text-sm">{t('upload.cover')}</p>
                        </>
                    )}
                </div>
            </div>

            {/* Form Fields */}
            <div className="md:col-span-2 space-y-5">
                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Track Title</label>
                    <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-dark-light border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium text-lg"
                    placeholder="e.g. Midnight City"
                    required
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Genre</label>
                    <select 
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                        className="w-full bg-dark-light border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors appearance-none"
                    >
                        <option value="">Select...</option>
                        <option value="Pop">Pop</option>
                        <option value="Hip Hop">Hip Hop</option>
                        <option value="Electronic">Electronic</option>
                        <option value="Rock">Rock</option>
                        <option value="Jazz">Jazz</option>
                        <option value="Lo-Fi">Lo-Fi</option>
                        <option value="R&B">R&B</option>
                        <option value="Indie">Indie</option>
                        <option value="Kizomba">Kizomba</option>
                        <option value="Samba">Samba</option>
                        <option value="Funk">Funk</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tags</label>
                    <input
                        type="text"
                        placeholder="#chill"
                        className="w-full bg-dark-light border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Description</label>
                    <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-dark-light border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors min-h-[120px] resize-none"
                    placeholder="Tell us about the inspiration behind this track..."
                    />
                </div>
            </div>
        </div>

        <button
          type="submit"
          disabled={uploading || !audioFile || !title}
          className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center space-x-2 transition-all transform hover:scale-[1.01] active:scale-[0.99] ${
            uploading || !audioFile || !title
              ? 'bg-slate-800 text-gray-600 cursor-not-allowed border border-slate-700'
              : 'bg-gradient-to-r from-primary to-indigo-600 hover:to-indigo-500 text-white shadow-xl shadow-primary/20'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Uploading...</span>
            </>
          ) : (
            <>
              <UploadCloud size={24} />
              <span>{t('upload.submit')}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Upload;
