"use client";

import React, { useState, useEffect, useRef } from "react";
import { Chapter } from "@/types/reader";
import {
  Headphones,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Loader2,
} from "lucide-react";

interface ChapterPodcastPlayerProps {
  chapter: Chapter;
}

const toPersianDigits = (num: number | string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[Number(d)]);
};

const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return "۰۰:۰۰";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const mm = String(mins).padStart(2, "0");
  const ss = String(secs).padStart(2, "0");
  if (hrs > 0) {
    const hh = String(hrs).padStart(2, "0");
    return toPersianDigits(`${hh}:${mm}:${ss}`);
  }
  return toPersianDigits(`${mm}:${ss}`);
};

const PLAYBACK_RATES = [1, 1.25, 1.5, 1.75, 2];

export const ChapterPodcastPlayer: React.FC<ChapterPodcastPlayerProps> = ({ chapter }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [checkingFile, setCheckingFile] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedPercent, setBufferedPercent] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);

  // Never show podcast on front-matter (Introduction)
  const isFrontMatter =
    chapter.id === "front-matter" || /front.?matter/i.test(chapter.id);

  useEffect(() => {
    if (isFrontMatter) {
      return;
    }

    let cancelled = false;

    // Candidate paths in public/podcasts/ supporting both ch-0.m4a and chapter0.m4a
    const altName = chapter.id.replace(/^ch-/, "chapter");
    const candidates = [
      chapter.podcastUrl,
      `/podcasts/${chapter.id}.m4a`,
      `/podcasts/${altName}.m4a`,
    ].filter((u): u is string => Boolean(u));

    const checkAvailablePodcast = async () => {
      for (const url of candidates) {
        try {
          const res = await fetch(url, { method: "HEAD", cache: "no-cache" });
          const contentType = res.headers.get("content-type") || "";
          // Ensure it's an existing file and not an HTML fallback 404 page
          if (res.ok && !contentType.includes("text/html")) {
            if (!cancelled) {
              setAudioUrl(url);
              setCheckingFile(false);
            }
            return;
          }
        } catch {
          // Try next candidate
        }
      }
      if (!cancelled) {
        setAudioUrl(null);
        setCheckingFile(false);
      }
    };

    checkAvailablePodcast();

    return () => {
      cancelled = true;
    };
  }, [chapter.id, chapter.podcastUrl, isFrontMatter]);

  if (isFrontMatter || checkingFile || !audioUrl) {
    return null;
  }

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        setIsBuffering(true);
        await audio.play();
      } catch {
        setIsPlaying(false);
      } finally {
        setIsBuffering(false);
      }
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = Number(e.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const skipBy = (deltaSeconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const maxTime = duration || audio.duration || 0;
    const nextTime = Math.max(0, Math.min(maxTime, audio.currentTime + deltaSeconds));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const cyclePlaybackRate = () => {
    const audio = audioRef.current;
    const nextIdx = (PLAYBACK_RATES.indexOf(playbackRate) + 1) % PLAYBACK_RATES.length;
    const nextRate = PLAYBACK_RATES[nextIdx];
    setPlaybackRate(nextRate);
    if (audio) {
      audio.playbackRate = nextRate;
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (audio) {
      audio.muted = nextMuted;
    }
  };

  const updateBuffered = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration || audio.buffered.length === 0) return;
    try {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      setBufferedPercent(Math.min(100, (bufferedEnd / audio.duration) * 100));
    } catch {}
  };

  const playedPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <div
      id={`chapter-podcast-player-${chapter.id}`}
      className="mb-8 rounded-2xl border border-emerald-200/80 dark:border-emerald-900/60 bg-gradient-to-l from-emerald-50/80 via-white/90 to-slate-50/90 dark:from-emerald-950/30 dark:via-slate-900/90 dark:to-slate-900/80 p-4 sm:p-5 shadow-sm transition-all"
      style={{ direction: "rtl" }}
    >
      {/* Hidden HTML5 Audio with preload="metadata" for HTTP Byte-Range Streaming */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onWaiting={() => setIsBuffering(true)}
        onCanPlay={() => setIsBuffering(false)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d)) setDuration(d);
          updateBuffered();
        }}
        onTimeUpdate={(e) => {
          setCurrentTime(e.currentTarget.currentTime);
          updateBuffered();
        }}
        onProgress={updateBuffered}
      />

      <div className="flex flex-col gap-3.5">
        {/* Top Row: Podcast Title & Streaming Badge */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/15 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate">
                  پادکست صوتی این فصل
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/60">
                  پخش آنلاین جریانی (Streaming)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                بدون نیاز به دانلود کامل فایل · گوش دادن همزمان با مطالعه فصل
              </p>
            </div>
          </div>

          {/* Speed & Mute Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={cyclePlaybackRate}
              className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-950/70 text-slate-700 dark:text-slate-200 text-xs font-mono font-bold transition-colors border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
              title="سرعت پخش پادکست"
            >
              {playbackRate}x
            </button>

            <button
              type="button"
              onClick={toggleMute}
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/80 dark:border-slate-700/80 cursor-pointer"
              title={isMuted ? "وصل صدا" : "قطع صدا"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Bottom Row: Transport Buttons + Interactive Seek Bar */}
        <div className="flex items-center gap-3">
          {/* Play / Pause Primary Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-sm transition-all cursor-pointer shrink-0 active:scale-95"
            title={isPlaying ? "توقف موقت" : "پخش پادکست"}
          >
            {isBuffering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 fill-current" />
            )}
          </button>

          {/* Skip -15s / +15s */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => skipBy(-15)}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px] font-bold"
              title="۱۵ ثانیه به عقب"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">۱۵-</span>
            </button>
            <button
              type="button"
              onClick={() => skipBy(15)}
              className="p-1.5 rounded-lg hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px] font-bold"
              title="۱۵ ثانیه به جلو"
            >
              <span className="hidden sm:inline">۱۵+</span>
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Seek Timeline Slider (LTR for natural audio progress left-to-right) */}
          <div className="flex-1 flex items-center gap-2.5" style={{ direction: "ltr" }}>
            <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 w-11 text-right shrink-0">
              {formatTime(currentTime)}
            </span>

            <div className="relative flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex items-center">
              {/* Buffered Progress Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-200/70 dark:bg-emerald-900/50 transition-all duration-200"
                style={{ width: `${bufferedPercent}%` }}
              />
              {/* Played Progress Bar */}
              <div
                className="absolute left-0 top-0 bottom-0 bg-emerald-600 dark:bg-emerald-500 transition-all duration-75"
                style={{ width: `${playedPercent}%` }}
              />
              <input
                type="range"
                min={0}
                max={duration || 100}
                step={0.5}
                value={currentTime}
                onChange={handleSeek}
                className="relative z-10 w-full h-full opacity-0 cursor-pointer"
                aria-label="نوار زمان پادکست"
              />
            </div>

            <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 w-11 shrink-0">
              {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
