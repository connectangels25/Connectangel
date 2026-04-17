import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Search, Menu, X, LogOut, Pencil, Camera, Check, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import logo from "@/assets/logo.png";

const NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Events", to: "/", isEvents: true },
  { label: "Chat", to: "/chat" },
  { label: "Blog", to: "/blog" },
  { label: "My Events", to: "/my-events" },
];

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [logoClicks, setLogoClicks] = useState(0);

  // Profile data from DB
  const [profileName, setProfileName] = useState<string>("");
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  // Edit form state
  const [editName, setEditName] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load profile from DB when user changes
  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    supabase
      .from("profiles")
      .select("name, avatar_url, is_admin")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setProfileName(data.name ?? user.user_metadata?.name ?? user.email ?? "User");
          setProfileAvatarUrl(data.avatar_url ?? null);
          setIsAdmin(data.is_admin ?? false);
        } else {
          setProfileName(user.user_metadata?.name ?? user.email ?? "User");
          setIsAdmin(false);
        }
      });
  }, [user]);

  const userEmail = user?.email ?? "";
  const userInitials = profileName
    ? profileName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  // ── Nav helpers ───────────────────────────────────────────────
  const handleNavClick = (link: typeof NAV_LINKS[number]) => {
    setMobileOpen(false);
    if (link.isEvents) {
      if (location.pathname === "/") {
        document.getElementById("events-section")?.scrollIntoView({ behavior: "smooth" });
      } else {
        navigate("/?scrollTo=events");
      }
    } else {
      navigate(link.to);
    }
  };

  const handleSignOut = async () => {
    setMobileOpen(false);
    setProfileOpen(false);
    await signOut();
    navigate("/login");
  };

  // ── Edit modal helpers ─────────────────────────────────────────
  const openEdit = () => {
    setEditName(profileName);
    setPreviewUrl(profileAvatarUrl);
    setPhotoFile(null);
    setEditOpen(true);
    setProfileOpen(false);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      let avatarUrl = profileAvatarUrl;

      // Upload photo if a new one was chosen
      // Uses the existing 'event-images' bucket (already configured with correct RLS).
      // Avatar is stored at {userId}/avatar.{ext} — first folder = userId, matching RLS policy.
      if (photoFile) {
        const ext = photoFile.name.split(".").pop();
        const path = `${user.id}/avatar.${ext}`;

        const { error: upErr } = await supabase.storage
          .from("event-images")
          .upload(path, photoFile, { upsert: true });

        if (upErr) throw upErr;

        const { data: urlData } = supabase.storage
          .from("event-images")
          .getPublicUrl(path);
        // Cache-bust so the browser fetches the new image immediately
        avatarUrl = `${urlData.publicUrl}?t=${Date.now()}`;
      }

      // Update profiles table
      const { error: dbErr } = await supabase
        .from("profiles")
        .update({ name: editName.trim(), avatar_url: avatarUrl })
        .eq("id", user.id);

      if (dbErr) throw dbErr;

      // Also update auth user_metadata so initials stay in sync
      await supabase.auth.updateUser({ data: { name: editName.trim() } });

      setProfileName(editName.trim());
      setProfileAvatarUrl(avatarUrl);
      setEditOpen(false);
      toast.success("Profile updated!");
    } catch (err: unknown) {
      toast.error((err as Error)?.message ?? "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  // ── Avatar display (shared) ────────────────────────────────────
  const AvatarCircle = ({ size = "sm" }: { size?: "sm" | "lg" }) => {
    const dim = size === "lg" ? "h-16 w-16 text-xl" : "h-8 w-8 lg:h-9 lg:w-9 text-xs";
    return profileAvatarUrl ? (
      <img
        src={profileAvatarUrl}
        alt={profileName}
        className={`${dim} rounded-full object-cover ring-2 ring-primary/30`}
      />
    ) : (
      <div className={`${dim} rounded-full bg-primary/20 flex items-center justify-center`}>
        <span className="font-semibold text-primary">{userInitials}</span>
      </div>
    );
  };

  return (
    <>
      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border relative">
        <div className="flex items-center gap-4 sm:gap-8">
          <Link 
            to="/" 
            className="flex items-center gap-2 outline-none"
            onClick={(e) => {
              const newCount = logoClicks + 1;
              if (newCount >= 10) {
                e.preventDefault();
                setLogoClicks(0);
                navigate("/admin");
              } else {
                setLogoClicks(newCount);
              }
            }}
          >
            <img src={logo} alt="ConnectAngels" className="h-8 w-8 sm:h-9 sm:w-9" />
            <span className="text-base sm:text-lg font-bold text-primary">ConnectAngels</span>
          </Link>
          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.label}
                onClick={() => handleNavClick(link)}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </button>
            ))}
            {isAdmin && (
              <button
                onClick={() => navigate("/admindashboard")}
                className="text-sm font-bold text-primary hover:opacity-80 transition-all flex items-center gap-2"
              >
                Admin Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Desktop right section */}
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <ThemeToggle />
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search"
              className="pl-9 pr-4 py-2 rounded-full bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 w-40 xl:w-48"
            />
          </div>
          <button
            onClick={() => navigate("/create-event")}
            className="px-4 lg:px-5 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Add Event +
          </button>

          {user ? (
            <div className="relative">
              {/* Profile avatar button */}
              <button
                id="profile-avatar-btn"
                onClick={() => setProfileOpen((p) => !p)}
                className="focus:outline-none hover:ring-2 hover:ring-primary/50 rounded-full transition-all"
                aria-label="Open profile menu"
              >
                <AvatarCircle size="sm" />
              </button>

              {/* Profile dropdown */}
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div
                    id="profile-dropdown"
                    className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-card border border-border shadow-xl z-50 overflow-hidden"
                  >
                    {/* Header with pencil edit */}
                    <div className="px-5 py-5 bg-primary/10 flex items-center gap-4 relative">
                      <div className="relative flex-shrink-0">
                        <AvatarCircle size="lg" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-foreground truncate">{profileName}</p>
                        <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                      </div>
                      {/* Pencil icon */}
                      <button
                        id="profile-edit-btn"
                        onClick={openEdit}
                        className="absolute top-3 right-3 h-7 w-7 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                        title="Edit profile"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="h-px bg-border" />
                    {/* Logout */}
                    <button
                      id="profile-logout-btn"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-5 py-3 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 lg:px-5 py-2 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-secondary transition-colors whitespace-nowrap"
              >
                Sign Up
              </button>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-card border-b border-border z-50 md:hidden">
            <div className="flex flex-col p-4 gap-1">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-left text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  {link.label}
                </button>
              ))}
              {isAdmin && (
                <button
                  onClick={() => { setMobileOpen(false); navigate("/admindashboard"); }}
                  className="text-left text-sm font-bold text-primary py-3 px-3 rounded-lg hover:bg-secondary transition-colors"
                >
                  Admin Dashboard
                </button>
              )}
              <div className="h-px bg-border my-2" />
              <button
                onClick={() => { setMobileOpen(false); navigate("/create-event"); }}
                className="text-left text-sm font-semibold text-primary py-3 px-3 rounded-lg hover:bg-secondary transition-colors"
              >
                Add Event +
              </button>

              {user ? (
                <>
                  {/* Mobile profile card */}
                  <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-primary/10 mt-1 relative">
                    <AvatarCircle size="sm" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground truncate">{profileName}</p>
                      <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <button
                      onClick={() => { setMobileOpen(false); openEdit(); }}
                      className="h-7 w-7 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-primary"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="text-left text-sm font-medium text-red-500 hover:text-red-600 py-3 px-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => { setMobileOpen(false); navigate("/login"); }}
                    className="text-left text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMobileOpen(false); navigate("/signup"); }}
                    className="text-left text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-3 rounded-lg hover:bg-secondary transition-colors"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── EDIT PROFILE MODAL ── */}
      {editOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !saving && setEditOpen(false)}
          />

          {/* Modal card */}
          <div
            id="edit-profile-modal"
            className="relative w-full max-w-sm rounded-2xl bg-card border border-border shadow-2xl overflow-hidden z-10"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="text-base font-semibold text-foreground">Edit Profile</h2>
              <button
                onClick={() => !saving && setEditOpen(false)}
                className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-5 py-6 flex flex-col items-center gap-5">
              {/* Avatar upload area */}
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-24 w-24 rounded-full object-cover ring-4 ring-primary/20"
                  />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center ring-4 ring-primary/20">
                    <span className="text-2xl font-bold text-primary">{userInitials}</span>
                  </div>
                )}
                {/* Camera overlay */}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                {/* Camera badge */}
                <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center ring-2 ring-card">
                  <Camera className="w-4 h-4 text-primary-foreground" />
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                  id="avatar-upload-input"
                />
              </div>
              <p className="text-xs text-muted-foreground -mt-2">Click photo to change</p>

              {/* Name input */}
              <div className="w-full">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Display Name
                </label>
                <input
                  id="edit-name-input"
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-secondary text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              {/* Email (read-only) */}
              <div className="w-full">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
                  Email
                </label>
                <input
                  type="text"
                  value={userEmail}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted/50 text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => !saving && setEditOpen(false)}
                disabled={saving}
                className="flex-1 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                id="save-profile-btn"
                onClick={handleSave}
                disabled={saving || !editName.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
                ) : (
                  <><Check className="w-4 h-4" /> Save</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
