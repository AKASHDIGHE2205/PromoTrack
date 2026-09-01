import { useCallback, useEffect, useRef, useState } from "react";
import {
  Camera,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Navigation,
  Compass,
  Clock,
  Calendar,
  LoaderCircle,
  AlertTriangle,
  X,
} from "lucide-react";
import moment from "moment";
import toast from "react-hot-toast";
import type { LocationDetails, LocationStatus } from "./types";
import { markAttendance } from "../../services/global/attendanceServices";

const SELFIE_MAX_DIMENSION = 480;
const SELFIE_QUALITY = 0.7;

const AddAttendance = () => {
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("detecting");
  const [locationError, setLocationError] = useState("");
  const [location, setLocation] = useState<LocationDetails | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [selfieCaptured, setSelfieCaptured] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const fetchCurrentLocation = useCallback((): Promise<LocationDetails> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          let pincode = "";
          let district = "";
          let state = "";

          // Reverse geocoding
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            );

            if (res.ok) {
              const data = await res.json();

              if (data?.display_name) {
                address = data.display_name;
              }

              const addr = data?.address || {};
              pincode = addr.postcode || "";
              district = addr.state_district || addr.county || addr.district || "";
              state = addr.state || "";
            }
          } catch {
            // Keep coordinates if reverse geocoding fails
          }

          resolve({
            lat: latitude,
            lng: longitude,
            accuracy,
            address,
            pincode,
            district,
            state,
            capturedAt: moment().format("hh:mm A"),
          });
        },
        (error) => {
          console.error("Location error:", error);

          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  }, []);

  const locationErrorMessage = (error: any) =>
    error?.code === error?.PERMISSION_DENIED
      ? "Location permission denied. Please allow access and retry."
      : error?.code === error?.TIMEOUT
        ? "Location request timed out. Please retry."
        : "Unable to detect your location. Please retry.";

  const detectLocation = useCallback(async () => {
    setLocationStatus("detecting");
    setLocationError("");

    try {
      const freshLocation = await fetchCurrentLocation();

      setLocation(freshLocation);
      setLocationStatus("captured");
    } catch (error) {
      setLocationError(locationErrorMessage(error));
      setLocationStatus("error");
    }
  }, [fetchCurrentLocation]);

  useEffect(() => {
    detectLocation();
  }, [detectLocation]);

  const openCamera = async () => {
    if (cameraLoading || cameraOpen) return;

    setCameraError("");
    setCameraLoading(true);

    try {
      // Check browser support
      if (!navigator.mediaDevices) {
        throw new Error("Camera API is not available in this browser.");
      }

      if (!navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera access is not supported by this browser.");
      }

      // Check secure context
      if (!window.isSecureContext) {
        throw new Error(
          "Camera access requires HTTPS. Please open this application using HTTPS.",
        );
      }

      // Stop any existing stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
      }

      // Request camera
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: {
            ideal: "user",
          },
          width: {
            ideal: 1280,
          },
          height: {
            ideal: 720,
          },
        },
        audio: false,
      });

      streamRef.current = stream;

      setCameraOpen(true);

      // Wait for React to render video element
      setTimeout(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          try {
            await videoRef.current.play();
          } catch (playError) {
            console.error("Video play error:", playError);
          }
        }
      }, 100);
    } catch (error) {
      console.error("Camera error:", error);

      let message = "Unable to access the camera.";

      if (error instanceof DOMException) {
        switch (error.name) {
          case "NotAllowedError":
            message = "Camera permission was denied. Please allow camera access in your browser settings.";
            break;

          case "NotFoundError":
            message = "No camera was found on this device.";
            break;

          case "NotReadableError":
            message = "Camera is already being used by another application.";
            break;

          case "OverconstrainedError":
            message = "The requested camera configuration is not supported.";
            break;

          case "SecurityError":
            message = "Camera access is blocked because this page is not secure. Please use HTTPS.";
            break;

          case "AbortError":
            message = "Camera access was interrupted. Please try again.";
            break;

          default:
            message = error.message || "Unable to access the camera.";
        }
      } else if (error instanceof Error) {
        message = error.message;
      }

      setCameraError(message);
      setCameraOpen(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraOpen(false);
  }, []);

  const captureSelfie = () => {
    const video = videoRef.current;

    const canvas = canvasRef.current;

    if (!video || !canvas) {
      setCameraError("Camera is not ready. Please try again.");

      return;
    }

    if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) {
      setCameraError(
        "Camera is still loading. Please wait a moment and try again.",
      );

      return;
    }

    const sourceWidth = video.videoWidth;

    const sourceHeight = video.videoHeight;

    if (!sourceWidth || !sourceHeight) {
      setCameraError("Unable to capture the camera frame. Please try again.");

      return;
    }

    const scale = Math.min(1, SELFIE_MAX_DIMENSION / Math.max(sourceWidth, sourceHeight));
    const width = Math.round(sourceWidth * scale);
    const height = Math.round(sourceHeight * scale);
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("Unable to process the camera image.");
      return;
    }
    context.save();
    context.translate(width, 0);
    context.scale(-1, 1);
    context.drawImage(video, 0, 0, width, height);
    context.restore();
    const image = canvas.toDataURL("image/jpeg", SELFIE_QUALITY);
    setSelfiePreview(image);
    setSelfieCaptured(true);
    stopCamera();
  };

  const retakeSelfie = async () => {
    setSelfieCaptured(false);
    setSelfiePreview(null);
    setCameraError("");
    await openCamera();
  };

  const resetSelfie = () => {
    stopCamera();
    setSelfieCaptured(false);
    setSelfiePreview(null);
    setCameraError("");
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());

        streamRef.current = null;
      }
    };
  }, []);

  const locationCaptured = locationStatus === "captured" && location !== null;
  const today = moment();

  const handleSubmit = async () => {
    if (submittingRef.current || !selfiePreview || !location) return;

    submittingRef.current = true;
    setSubmitting(true);

    let freshLocation: LocationDetails;

    try {
      freshLocation = await fetchCurrentLocation();
      setLocation(freshLocation);
      setLocationStatus("captured");
    } catch (error) {
      setLocationError(locationErrorMessage(error));
      setLocationStatus("error");
      toast.error("Could not refresh your location. Please try again.");
      submittingRef.current = false;
      setSubmitting(false);
      return;
    }

    try {
      const blob = await (await fetch(selfiePreview)).blob();

      const response = await markAttendance({
        selfie: blob,
        latitude: freshLocation.lat,
        longitude: freshLocation.lng,
        location: freshLocation.address,
        pincode: freshLocation.pincode,
        district: freshLocation.district,
        state: freshLocation.state,
      });

      if (response.success) {
        toast.success(response.message || "Attendance marked successfully.");
        resetSelfie();
      }
    } catch (err: any) {
      toast.error(typeof err === "string" ? err : "Failed to mark attendance.");
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50">
            <Camera className="w-5 h-5 text-blue-600" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Mark Attendance
            </h1>

            <p className="text-sm text-gray-500">
              Capture your selfie and current location to check in
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-gray-200 bg-white px-4 py-2.5 shadow-sm">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-gray-400" />

            {today.format("DD MMM YYYY")}
          </div>

          <div className="w-px h-4 bg-gray-200" />

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock className="w-4 h-4 text-gray-400" />

            {today.format("hh:mm A")}
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Selfie Verification
            </h3>

            {selfieCaptured && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Captured
              </span>
            )}
          </div>

          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50">
            {/* LIVE CAMERA */}
            {cameraOpen && !selfieCaptured && (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="absolute inset-0 w-full h-full object-cover scale-x-[-1]"
              />
            )}

            {/* CAPTURED SELFIE */}
            {selfieCaptured && selfiePreview && (
              <img
                src={selfiePreview}
                alt="Captured selfie"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {/* INITIAL PLACEHOLDER */}
            {!cameraOpen && !selfieCaptured && !cameraError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 px-6 text-center">
                <div className="p-4 rounded-full bg-white shadow-sm border border-gray-200">
                  <Camera className="w-7 h-7" />
                </div>

                <p className="text-sm font-medium text-gray-500">
                  Camera preview will appear here
                </p>

                <p className="text-xs text-gray-400">
                  Align your face within the frame and capture
                </p>
              </div>
            )}

            {/* CAMERA ERROR */}
            {cameraError && (
              <div className="absolute inset-0 flex items-center justify-center bg-white p-6 text-center">
                <div className="max-w-sm">
                  <div className="p-3 rounded-full bg-rose-50 inline-flex mb-3">
                    <AlertTriangle className="w-7 h-7 text-rose-500" />
                  </div>

                  <p className="text-sm font-medium text-rose-700">
                    {cameraError}
                  </p>

                  <p className="text-xs text-gray-400 mt-2">
                    Please check your camera permission and try again.
                  </p>
                </div>
              </div>
            )}

            {/* FACE GUIDE */}
            {(cameraOpen || selfieCaptured) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className={`w-36 h-48 rounded-[50%] border-2 ${selfieCaptured ? "border-emerald-400/70" : "border-white/80"
                    }`}
                />
              </div>
            )}

            {/* CAMERA CLOSE BUTTON */}
            {cameraOpen && (
              <button
                type="button"
                onClick={stopCamera}
                className="absolute top-3 right-3 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                aria-label="Close camera"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* HIDDEN CANVAS */}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="flex gap-3 mt-4">
            {/* OPEN CAMERA */}
            {!cameraOpen && !selfieCaptured && (
              <button
                type="button"
                onClick={openCamera}
                disabled={cameraLoading}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {cameraLoading ? (
                  <>
                    <LoaderCircle className="w-4 h-4 animate-spin" />
                    Opening Camera...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Capture Selfie
                  </>
                )}
              </button>
            )}

            {/* TAKE PHOTO */}
            {cameraOpen && !selfieCaptured && (
              <button
                type="button"
                onClick={captureSelfie}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Take Photo
              </button>
            )}

            {/* RETAKE */}
            {selfieCaptured && (
              <>
                <button
                  type="button"
                  onClick={retakeSelfie}
                  disabled={cameraLoading || submitting}
                  className="flex-1 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${cameraLoading ? "animate-spin" : ""}`}
                  />
                  Retake
                </button>

                <div className="flex-1 rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-2.5 text-sm font-medium text-emerald-700 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Preview Ready
                </div>
              </>
            )}
          </div>

          {/* RESET SELFIE */}
          {(selfieCaptured || cameraError) && (
            <button
              type="button"
              onClick={resetSelfie}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              Reset camera
            </button>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-6 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Location Verification
            </h3>

            {locationCaptured && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Captured
              </span>
            )}
          </div>

          {/* DETECTING */}
          {locationStatus === "detecting" && (
            <div className="rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-6 py-8 flex flex-col items-center justify-center gap-2 text-center">
              <div className="p-4 rounded-full bg-white shadow-sm border border-gray-200">
                <LoaderCircle className="w-7 h-7 text-blue-500 animate-spin" />
              </div>

              <p className="text-sm font-medium text-gray-500">
                Detecting your location&hellip;
              </p>

              <p className="text-xs text-gray-400">
                This happens automatically on page load
              </p>
            </div>
          )}

          {/* ERROR */}
          {locationStatus === "error" && (
            <div className="rounded-xl border-2 border-dashed border-rose-200 bg-rose-50 px-6 py-8 flex flex-col items-center justify-center gap-2 text-center">
              <div className="p-4 rounded-full bg-white shadow-sm border border-rose-200">
                <AlertTriangle className="w-7 h-7 text-rose-500" />
              </div>

              <p className="text-sm font-medium text-rose-700">
                {locationError || "Unable to detect location."}
              </p>

              <p className="text-xs text-rose-400">
                Check your location permission and try again
              </p>
            </div>
          )}

          {/* LOCATION DETAILS */}
          {locationCaptured && location && (
            <div className="mt-4 space-y-2">
              {/* ADDRESS */}
              <div className="flex items-start gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />

                <div className="min-w-0">
                  <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                    Detailed Address
                  </p>

                  <p className="text-sm text-blue-700 leading-snug">
                    {location.address}
                  </p>
                </div>
              </div>

              {/* LOCATION VALUES */}
              <div className="grid grid-cols-3 gap-2">
                {/* LATITUDE */}
                <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                  <Navigation className="w-4 h-4 text-gray-400 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                      Latitude
                    </p>

                    <p className="text-sm text-blue-700 font-medium">
                      {location.lat.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* LONGITUDE */}
                <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                  <Compass className="w-4 h-4 text-gray-400 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-[11px] text-gray-400 uppercase tracking-wide">
                      Longitude
                    </p>

                    <p className="text-sm text-blue-700 font-medium">
                      {location.lng.toFixed(6)}
                    </p>
                  </div>
                </div>

                {/* CAPTURED AT */}
                <div className="flex items-center gap-2.5 rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5">
                  <Clock className="w-4 h-4 text-gray-400 shrink-0" />

                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                      Captured At
                    </p>

                    <p className="text-sm text-blue-700 font-medium">
                      {location.capturedAt}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white shadow-sm p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-gray-400 text-center sm:text-left">
          Both selfie and location must be captured before you can submit your
          attendance.
        </p>

        <div className="flex gap-3 w-full sm:w-auto">
          {/* RESET */}
          <button
            type="button"
            disabled={submitting}
            onClick={() => {
              resetSelfie();
              detectLocation();
            }}
            className="flex-1 sm:flex-none rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Reset
          </button>

          {/* SUBMIT */}
          <button
            type="button"
            disabled={!(selfieCaptured && locationCaptured) || submitting}
            onClick={handleSubmit}
            className="flex-1 sm:flex-none rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <LoaderCircle className="w-4 h-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Submit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddAttendance;
