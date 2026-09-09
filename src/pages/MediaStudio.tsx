import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Download,
  ImagePlus,
  Upload,
  X,
} from "lucide-react";
import { useMedia, validMedia, videoEmbed } from "@/lib/storefront";
import type { Media } from "@/lib/storefront";
function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () =>
      reject(new Error("Couldn’t read that file. Please try again."));
    reader.readAsDataURL(file);
  });
}
export default function MediaStudio() {
  const { media, setMedia } = useMedia();
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [video, setVideo] = useState(media.video);
  const [dirty, setDirty] = useState(false);
  const importer = useRef<HTMLInputElement>(null);
  function update(value: Media) {
    setMedia(value);
    setDirty(true);
  }
  async function upload(event: ChangeEvent<HTMLInputElement>, hero = false) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!files.length) return;
    if (!hero && files.length + media.photos.length > 8) {
      setNotice("There’s room for 8 photos. Remove one first to add another.");
      return;
    }
    if (
      files.some(
        (file) =>
          !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
          file.size > 5 * 1024 * 1024,
      )
    ) {
      setNotice("Use JPG, PNG, or WebP photos smaller than 5 MB each.");
      return;
    }
    setBusy(true);
    setNotice("");
    try {
      const sources = await Promise.all(files.map(readFile));
      update(
        hero
          ? { ...media, hero: sources[0] }
          : {
              ...media,
              photos: [
                ...media.photos,
                ...sources.map((src, i) => ({
                  src,
                  alt: files[i].name
                    .replace(/\.[^.]+$/, "")
                    .replace(/[-_]/g, " "),
                  caption: "",
                })),
              ],
            },
      );
      setNotice(
        hero
          ? "Cover photo updated in your preview."
          : "Photos added. Add a caption, then take a look.",
      );
    } catch (error) {
      setNotice(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  function move(index: number, direction: number) {
    const photos = [...media.photos];
    [photos[index], photos[index + direction]] = [
      photos[index + direction],
      photos[index],
    ];
    update({ ...media, photos });
  }
  function download() {
    const next = { ...media, video: video.trim() };
    if (!validMedia(next)) {
      setNotice(
        "Give each photo a description, and use a valid YouTube link or leave the video empty.",
      );
      return;
    }
    update(next);
    const blob = new Blob([JSON.stringify(next, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "storefront.json";
    anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setDirty(false);
    setNotice(
      "Media file downloaded. You can import it here anytime. The public site hasn’t changed.",
    );
  }
  async function importMedia(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 60 * 1024 * 1024) {
      setNotice("That file is too large. Try a media file under 60 MB.");
      return;
    }
    try {
      const value: unknown = JSON.parse(await file.text());
      if (!validMedia(value)) throw new Error();
      update(value);
      setVideo(value.video);
      setNotice("Your saved photos and video are back in the preview.");
    } catch {
      setNotice("That file doesn’t look like a David Slings media file.");
    }
  }
  return (
    <div className="studio-page">
      <header className="checkout-header shell">
        <Link className="wordmark" to="/">
          david slings<span className="brand-dot">✳</span>
        </Link>
        <Link className="text-link" to="/">
          See the storefront <ArrowUpRight size={15} />
        </Link>
      </header>
      <main className="studio-main shell">
        <Link to="/" className="back-link">
          <ArrowLeft size={14} />
          Back to the storefront
        </Link>
        <div className="studio-heading">
          <div>
            <p className="eyebrow">MAKE IT YOURS</p>
            <h1>Your photos. Your sling.</h1>
            <p>Drop in the real stuff. See how it looks.</p>
          </div>
          <button className="button" onClick={download} disabled={busy}>
            <Download size={17} />
            Download changes
          </button>
        </div>
        <div className="studio-notice">
          <strong>
            {dirty
              ? "You have unsaved preview changes."
              : "This is your photo preview workspace."}
          </strong>
          <p>
            Changes stay in this tab until you reload. Download them to keep a
            copy. Import that file to pick up where you left off. Publishing is
            a separate step.
          </p>
        </div>
        <p className="studio-status" role="status">
          {notice}
        </p>
        <section className="studio-section">
          <div className="studio-section-heading">
            <div>
              <h2>The cover photo</h2>
              <p>This appears at the top of the page and beside your sling.</p>
            </div>
            <label
              className={`secondary-button upload-label ${busy ? "is-busy" : ""}`}
            >
              <ImagePlus size={17} />
              Replace cover
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                disabled={busy}
                onChange={(event) => upload(event, true)}
              />
            </label>
          </div>
          <img
            className="studio-cover"
            src={media.hero}
            alt="Current storefront cover"
          />
        </section>
        <section className="studio-section">
          <div className="studio-section-heading">
            <div>
              <h2>
                The photo strip <span>{media.photos.length}/8</span>
              </h2>
              <p>A mix of your sling, the details, and a good day out.</p>
            </div>
            <label
              className={`secondary-button upload-label ${busy || media.photos.length >= 8 ? "is-busy" : ""}`}
            >
              <ImagePlus size={17} />
              Add photos
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={busy || media.photos.length >= 8}
                onChange={(event) => upload(event)}
              />
            </label>
          </div>
          <div className="studio-photos">
            {media.photos.map((photo, index) => (
              <article className="studio-photo" key={index}>
                <img src={photo.src} alt={photo.alt} />
                <div className="studio-photo-tools">
                  <span>Photo {index + 1}</span>
                  <button
                    aria-label={`Move photo ${index + 1} earlier`}
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                  >
                    <ArrowUp size={15} />
                  </button>
                  <button
                    aria-label={`Move photo ${index + 1} later`}
                    disabled={index === media.photos.length - 1}
                    onClick={() => move(index, 1)}
                  >
                    <ArrowDown size={15} />
                  </button>
                  <button
                    aria-label={`Remove photo ${index + 1}`}
                    disabled={media.photos.length === 1}
                    onClick={() =>
                      update({
                        ...media,
                        photos: media.photos.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
                <label>
                  Caption
                  <input
                    value={photo.caption}
                    placeholder="A few words, if you want."
                    maxLength={120}
                    onChange={(event) =>
                      update({
                        ...media,
                        photos: media.photos.map((item, i) =>
                          i === index
                            ? { ...item, caption: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
                <label>
                  Describe the photo{" "}
                  <span className="optional">(for screen readers)</span>
                  <input
                    value={photo.alt}
                    maxLength={250}
                    required
                    onChange={(event) =>
                      update({
                        ...media,
                        photos: media.photos.map((item, i) =>
                          i === index
                            ? { ...item, alt: event.target.value }
                            : item,
                        ),
                      })
                    }
                  />
                </label>
              </article>
            ))}
          </div>
          <p className="field-note">
            JPG, PNG, or WebP · Up to 5 MB each. The starting images are a sling
            illustration and sample outdoor photos.
          </p>
        </section>
        <section className="studio-section">
          <h2>The how-to video</h2>
          <p>Paste your YouTube video link. An unlisted video works, too.</p>
          <div className="video-input">
            <label className="sr-only" htmlFor="video-url">
              YouTube video link
            </label>
            <input
              id="video-url"
              type="url"
              value={video}
              placeholder="https://www.youtube.com/watch?v=…"
              onChange={(event) => setVideo(event.target.value)}
            />
            <button
              className="secondary-button"
              onClick={() => {
                if (video && !videoEmbed(video.trim())) {
                  setNotice("Use a valid YouTube video link.");
                  return;
                }
                update({ ...media, video: video.trim() });
                setNotice(
                  video
                    ? "Video added to the storefront preview."
                    : "Video removed from the preview.",
                );
              }}
            >
              Apply <ArrowRight size={16} />
            </button>
          </div>
          <p className="field-note">
            Leave it empty to show the “how-to coming soon” message.
          </p>
        </section>
        <div className="studio-bottom">
          <button
            className="secondary-button"
            onClick={() => importer.current?.click()}
          >
            <Upload size={16} />
            Import saved changes
          </button>
          <input
            hidden
            ref={importer}
            type="file"
            accept="application/json,.json"
            onChange={importMedia}
          />
          <Link className="button" to="/">
            See your changes <ArrowUpRight size={17} />
          </Link>
        </div>
      </main>
    </div>
  );
}
