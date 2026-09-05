"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getThumbPath } from "@/lib/utils";
import { ChevronDown, Cat, Home, PawPrint, Shield, Heart, Plus, Trash2, Check } from "lucide-react";
import { type Partner, type Font } from "@/lib/settings";
import { themes, type Theme } from "@/components/theme-provider";

type BatchEssentials = {
  name: string;
  price: string;
  tx: string;
};

type Batch = {
  id: number;
  name: string;
  status: string;
  startDate: string;
  targetDate: string;
  fees: string;
  cats: string;
  food: string;
  txHash: string;
  isActive: boolean;
  receiptImages: string[];
  receiptStore: string;
  receiptItem: string;
  receiptTotal: string;
  notes: string;
  photos: string[];
  essentials: BatchEssentials[];
};

function formatDateInput(date: Date): string {
  return date.toISOString().split("T")[0];
}

function parseFees(fees: string): number {
  return Number(fees.replace(/[^0-9.]/g, "")) || 0;
}

function calculateCats(fees: string): string {
  return String(Math.floor(parseFees(fees)));
}

function BatchEditor({
  batch,
  onChange,
  onSave,
  onCancel,
  loading,
}: {
  batch: Batch;
  onChange: (batch: Batch) => void;
  onSave: (batch: Batch) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <Card className="border-2 border-border shadow-shadow bg-white">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-heading">
          {batch.id >= 0 ? `Edit ${batch.name || "Batch"}` : "Create New Batch"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2 pb-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-base text-foreground/60 block">Batch Name</label>
            <Input
              value={batch.name}
              onChange={(e) => onChange({ ...batch, name: e.target.value })}
              placeholder="Batch #6"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-base text-foreground/60 block">Start Date</label>
            <Input
              type="date"
              value={batch.startDate}
              onChange={(e) => onChange({ ...batch, startDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-base text-foreground/60 block">Target Date</label>
            <Input
              type="date"
              value={batch.targetDate}
              onChange={(e) => onChange({ ...batch, targetDate: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-base text-foreground/60 block">Funds Raised (USD)</label>
            <Input
              value={batch.fees}
              onChange={(e) =>
                onChange({
                  ...batch,
                  fees: e.target.value,
                  cats: calculateCats(e.target.value),
                })
              }
              placeholder="$0"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2 border-t-2 border-border">
          <Button onClick={() => onSave(batch)} disabled={loading}>
            Save Batch
          </Button>
          <Button variant="neutral" onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingBatch, setEditingBatch] = useState<Batch | null>(null);
  const [message, setMessage] = useState("");
  const [expandedPhotos, setExpandedPhotos] = useState<Set<number>>(new Set());
  const [expandedBatches, setExpandedBatches] = useState<Set<number>>(new Set());
  const [tokenCa, setTokenCa] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectLogo, setProjectLogo] = useState("");
  const [heroBackground, setHeroBackground] = useState("");
  const [creatorWallet, setCreatorWallet] = useState("");
  const [foundationWallet, setFoundationWallet] = useState("");
  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [partnerApplyLink, setPartnerApplyLink] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [theme, setTheme] = useState<Theme>("original");
  const [font, setFont] = useState<Font>("default");
  const [notificationText, setNotificationText] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [favicon, setFavicon] = useState("");
  const [histatsCode, setHistatsCode] = useState("");
  const [swapFeeBps, setSwapFeeBps] = useState(100);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState("");
  const [showImpactSection, setShowImpactSection] = useState(true);
  const [fundActivityEnabled, setFundActivityEnabled] = useState(false);
  const [fundActivityMinUsd, setFundActivityMinUsd] = useState(1);
  const [fundActivityPollSeconds, setFundActivityPollSeconds] = useState(60);
  const [tplDonation, setTplDonation] = useState("");
  const [tplRewards, setTplRewards] = useState("");
  const [tplPurchase, setTplPurchase] = useState("");
  const [tplBatch, setTplBatch] = useState("");
  const [tplFeedingProof, setTplFeedingProof] = useState("");
  const [fundLog, setFundLog] = useState<Array<{
    id: number; ts: number; type: string; status: string;
    token: string; amount: number | null; usdValue: number | null;
    sender: string | null; txHash: string | null; message: string;
  }>>([]);
  const [fundTelegram, setFundTelegram] = useState<{
    configured: boolean; bot: boolean; chat: boolean; fundTopic: boolean; batchTopic: boolean; feedingProofTopic: boolean;
  } | null>(null);
  const [rwSol, setRwSol] = useState("");
  const [rwUsd, setRwUsd] = useState("");
  const [rwTx, setRwTx] = useState("");
  const [rwBatch, setRwBatch] = useState("");
  const [prStore, setPrStore] = useState("");
  const [prItem, setPrItem] = useState("");
  const [prUsd, setPrUsd] = useState("");
  const [prTx, setPrTx] = useState("");
  const [prReceipt, setPrReceipt] = useState("");
  const [prBatch, setPrBatch] = useState("");
  const [fundDebug, setFundDebug] = useState<
    { ok: boolean; chats?: Array<{ id: number; title: string; topics: Array<{ threadId: number; name: string }> }>; error?: string }
    | null>(null);

  useEffect(() => {
    const storedPassword = sessionStorage.getItem("adminPassword");
    if (!storedPassword) return;
    let cancelled = false;
    fetch("/api/auth", {
      cache: "no-store",
      headers: { authorization: `Bearer ${storedPassword}` },
    })
      .then((res) => {
        if (cancelled) return;
        if (res.ok) {
          setPassword(storedPassword);
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem("adminPassword");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBatches();
      fetchSettings();
      fetchFundLog();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  async function fetchSettings() {
    try {
      const res = await fetch("/api/settings", {
        cache: "no-store",
        headers: { authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      setTokenCa(data.tokenCa || "");
      setProjectName(data.projectName || "");
      setProjectLogo(data.projectLogo || "");
      setHeroBackground(data.heroBackground || "");
      setCreatorWallet(data.creatorWallet || "");
      setFoundationWallet(data.foundationWallet || "");
      setTelegram(data.telegram || "");
      setTwitter(data.twitter || "");
      setInstagram(data.instagram || "");
      setTiktok(data.tiktok || "");
      setPartnerApplyLink(data.partnerApplyLink || "");
      setPartners(Array.isArray(data.partners) ? data.partners : []);
      setTheme(data.theme && ["original", "mint", "lavender", "lemon"].includes(data.theme) ? data.theme : "original");
      setFont(data.font && ["default", "custom"].includes(data.font) ? data.font : "default");
      setNotificationText(data.notificationText || "");
      setSeoTitle(data.seoTitle || "");
      setSeoDescription(data.seoDescription || "");
      setSeoKeywords(data.seoKeywords || "");
      setOgImage(data.ogImage || "");
      setFavicon(data.favicon || "");
      setHistatsCode(data.histatsCode || "");
      setSwapFeeBps(typeof data.swapFeeBps === "number" ? data.swapFeeBps : 100);
      setMaintenanceMode(Boolean(data.maintenanceMode));
      setMaintenanceMessage(data.maintenanceMessage || "");
      setShowImpactSection(data.showImpactSection !== false);
      setFundActivityEnabled(Boolean(data.fundActivityEnabled));
      setFundActivityMinUsd(
        typeof data.fundActivityMinUsd === "number" ? data.fundActivityMinUsd : 1
      );
      setFundActivityPollSeconds(
        typeof data.fundActivityPollSeconds === "number" ? data.fundActivityPollSeconds : 60
      );
      setTplDonation(data.tplDonation || "");
      setTplRewards(data.tplRewards || "");
      setTplPurchase(data.tplPurchase || "");
      setTplBatch(data.tplBatch || "");
      setTplFeedingProof(data.tplFeedingProof || "");
    } catch {
      setMessage("Failed to load settings");
    }
  }

  async function fetchFundLog() {
    try {
      const res = await fetch("/api/fund-activity/log", {
        cache: "no-store",
        headers: { authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      setFundLog(Array.isArray(data.log) ? data.log : []);
      setFundTelegram(data.telegram || null);
    } catch {
      // ignore
    }
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${password}`,
        },
        body: JSON.stringify({
          tokenCa,
          projectName,
          projectLogo,
          heroBackground,
          creatorWallet,
          foundationWallet,
          telegram,
          twitter,
          instagram,
          tiktok,
          partnerApplyLink,
          partners,
          theme,
          font,
          notificationText,
          seoTitle,
          seoDescription,
          seoKeywords,
          ogImage,
          favicon,
          histatsCode,
          swapFeeBps,
          maintenanceMode,
          maintenanceMessage,
          showImpactSection,
          fundActivityEnabled,
          fundActivityMinUsd,
          fundActivityPollSeconds,
          tplDonation,
          tplRewards,
        tplPurchase,
        tplBatch,
        tplFeedingProof,
      }),
      });
      if (res.ok) {
        setMessage("Settings saved successfully");
      } else {
        const data = await res.json().catch(() => ({}));
        setMessage(data.error || "Failed to save settings");
      }
    } catch {
      setMessage("Error saving settings");
    }
    setLoading(false);
  }

  function addPartner() {
    setPartners((prev) => [
      ...prev,
      {
        name: "",
        description: "",
        href: "",
        icon: "Cat",
        logo: "",
        socials: { instagram: "", facebook: "", tiktok: "" },
      },
    ]);
  }

  function removePartner(index: number) {
    setPartners((prev) => prev.filter((_, i) => i !== index));
  }

  function updatePartner(index: number, field: keyof Partner, value: string) {
    setPartners((prev) =>
      prev.map((p, i) => (i === index ? { ...p, [field]: value } : p))
    );
  }

  function updatePartnerSocial(
    index: number,
    field: keyof Partner["socials"],
    value: string
  ) {
    setPartners((prev) =>
      prev.map((p, i) =>
        i === index ? { ...p, socials: { ...p.socials, [field]: value } } : p
      )
    );
  }

  async function uploadPartnerLogo(index: number, file: File) {
    const path = await uploadSingleFile(file, "partners", "photo");
    if (path) {
      setPartners((prev) =>
        prev.map((p, i) => (i === index ? { ...p, logo: path } : p))
      );
      setMessage("Partner logo uploaded");
    } else {
      setMessage("Partner logo upload failed");
    }
  }

  async function uploadProjectLogo(file: File) {
    const path = await uploadSingleFile(file, "logo", "logo");
    if (path) {
      setProjectLogo(path);
      setMessage("Project logo uploaded");
    } else {
      setMessage("Project logo upload failed");
    }
  }

  async function uploadFavicon(file: File) {
    const path = await uploadSingleFile(file, "favicon", "logo");
    if (path) {
      setFavicon(path);
      setMessage("Favicon uploaded");
    } else {
      setMessage("Favicon upload failed");
    }
  }

  async function uploadHeroBackground(file: File) {
    const path = await uploadSingleFile(file, "hero", "background");
    if (path) {
      setHeroBackground(path);
      setMessage("Hero background uploaded");
    } else {
      setMessage("Hero background upload failed");
    }
  }

  async function fetchBatches() {
    setLoading(true);
    try {
      const res = await fetch("/api/batches", {
        cache: "no-store",
        headers: { authorization: `Bearer ${password}` },
      });
      const data = await res.json();
      setBatches(data);
    } catch {
      setMessage("Failed to load batches");
    }
    setLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        cache: "no-store",
        headers: { authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        setIsAuthenticated(true);
        sessionStorage.setItem("adminPassword", password);
      } else {
        setMessage("Invalid password");
      }
    } catch {
      setMessage("Login failed");
    }
    setLoading(false);
  }

  async function saveBatch(batch: Batch) {
    setLoading(true);
    try {
      const res = await fetch("/api/batches", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          authorization: `Bearer ${password}`,
        },
        body: JSON.stringify(batch),
      });
      if (res.ok) {
        setMessage("Batch saved successfully");
        setEditingBatch(null);
        await fetchBatches();
      } else {
        setMessage("Failed to save batch");
      }
    } catch {
      setMessage("Error saving batch");
    }
    setLoading(false);
  }

  async function deleteBatch(id: number) {
    if (!confirm("Are you sure you want to delete this batch?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/batches/${id}`, {
        method: "DELETE",
        headers: { authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        setMessage("Batch deleted");
        fetchBatches();
      } else {
        setMessage("Failed to delete batch");
      }
    } catch {
      setMessage("Error deleting batch");
    }
    setLoading(false);
  }

  async function clearAllData() {
    const ok = confirm(
      "This will permanently delete ALL batches, receipts, the fund-activity log, and EVERY uploaded photo (batch, logo, favicon, partners). Settings are kept. This cannot be undone. Continue?"
    );
    if (!ok) return;
    if (!confirm("Really sure? This wipes the project back to empty. There is no undo.")) return;
    setLoading(true);
    try {
      const res = await fetch("/api/clear-data", {
        method: "POST",
        headers: { authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        setMessage("All data cleared. Project is now empty.");
        fetchBatches();
      } else {
        setMessage("Failed to clear data");
      }
    } catch {
      setMessage("Error clearing data");
    }
    setLoading(false);
  }

  async function uploadSingleFile(file: File, folder: string, type: string = "photo"): Promise<string | null> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("type", type);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { authorization: `Bearer ${password}` },
        body: formData,
      });
      const data = await res.json();
      return data.success ? data.path : null;
    } catch {
      return null;
    }
  }

  async function uploadReceipts(files: FileList, batchId: number) {
    setLoading(true);
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) {
      setLoading(false);
      return;
    }

    const newPaths: string[] = [];
    for (const file of Array.from(files)) {
      const path = await uploadSingleFile(file, `batch-${batchId}`, "receipt");
      if (path) {
        newPaths.push(path);
      }
    }

    if (newPaths.length > 0) {
      await saveBatch({ ...batch, receiptImages: [...batch.receiptImages, ...newPaths] });
      setMessage(`${newPaths.length} receipt image(s) uploaded`);
    } else {
      setMessage("Receipt upload failed");
    }
    setLoading(false);
  }

  async function uploadPhotos(files: FileList, batchId: number) {
    setLoading(true);
    const batch = batches.find((b) => b.id === batchId);
    if (!batch) {
      setLoading(false);
      return;
    }

    const newPaths: string[] = [];
    for (const file of Array.from(files)) {
      const path = await uploadSingleFile(file, `batch-${batchId}`, "photo");
      if (path) {
        newPaths.push(path);
      }
    }

    if (newPaths.length > 0) {
      await saveBatch({ ...batch, photos: [...batch.photos, ...newPaths] });
      setMessage(`${newPaths.length} photo(s) uploaded`);
    } else {
      setMessage("Photo upload failed");
    }
    setLoading(false);
  }

  function toggleBatchExpanded(id: number) {
    setExpandedBatches((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function updateBatchField(id: number, field: keyof Batch, value: string) {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  }

  function updateEssentials(id: number, essentials: BatchEssentials[]) {
    setBatches((prev) =>
      prev.map((b) => (b.id === id ? { ...b, essentials } : b))
    );
  }

  function addEssential(id: number) {
    const batch = batches.find((b) => b.id === id);
    if (!batch) return;
    const next: BatchEssentials = { name: "", price: "$0", tx: "" };
    updateEssentials(id, [...(batch.essentials || []), next]);
  }

  function updateEssentialField(
    id: number,
    index: number,
    field: "name" | "price" | "tx",
    value: string
  ) {
    const batch = batches.find((b) => b.id === id);
    if (!batch) return;
    const essentials = (batch.essentials || []).map((e, i) =>
      i === index ? { ...e, [field]: value } : e
    );
    updateEssentials(id, essentials);
  }

  function removeEssential(id: number, index: number) {
    const batch = batches.find((b) => b.id === id);
    if (!batch) return;
    updateEssentials(id, (batch.essentials || []).filter((_, i) => i !== index));
  }

  function createNewBatch() {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    const newBatch: Batch = {
      id: -1,
      name: "",
      status: "In Progress",
      startDate: formatDateInput(today),
      targetDate: formatDateInput(nextWeek),
      fees: "$0",
      cats: "0",
      food: "0kg",
      txHash: "-",
      isActive: true,
      receiptImages: [],
      receiptStore: "",
      receiptItem: "",
      receiptTotal: "$0",
      notes: "",
      photos: [],
      essentials: [],
    };
    setEditingBatch(newBatch);
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-2 border-border shadow-shadow">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-heading text-center">Admin Login</CardTitle>
            <p className="text-sm font-base text-foreground/60 text-center mt-1">
              Enter your password to manage batches
            </p>
          </CardHeader>
          <CardContent className="pt-2 pb-6">
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                type="password"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full"
              />
              <Button type="submit" className="w-full" disabled={!password || loading}>
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b-2 border-border">
          <div>
            <h1 className="text-3xl font-heading text-foreground">{projectName || "CATFUND"} Admin</h1>
            <p className="text-sm font-base text-foreground/60 mt-1">Manage feeding batches, receipts, photos, and settings</p>
          </div>
          <Button variant="neutral" onClick={() => { setIsAuthenticated(false); sessionStorage.removeItem("adminPassword"); }}>
            Logout
          </Button>
        </div>

        <Tabs defaultValue="batches" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

        <TabsContent value="batches" className="space-y-6">
          {message && (
            <div className="bg-main border-2 border-border rounded-base px-4 py-3 text-sm font-base text-main-foreground">
              {message}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={createNewBatch} disabled={loading}>+ New Batch</Button>
            <Button variant="neutral" onClick={fetchBatches} disabled={loading}>
              Refresh
            </Button>
            {loading && <span className="text-sm font-base text-foreground/60">Loading...</span>}
          </div>

          {editingBatch?.id === -1 && (
            <BatchEditor
              batch={editingBatch}
              onChange={setEditingBatch}
              onSave={saveBatch}
              onCancel={() => setEditingBatch(null)}
              loading={loading}
            />
          )}

        <div className="space-y-4">
          {batches.length === 0 && !loading && (
            <div className="text-center py-10 border-2 border-dashed border-border rounded-base">
              <p className="text-sm font-base text-foreground/50">No batches yet. Click &quot;New Batch&quot; to create one.</p>
            </div>
          )}

          {batches.map((batch) => {
            const isExpanded = expandedBatches.has(batch.id);
            return (
            <div key={batch.id} className="space-y-4">
              <Card className="border-2 border-border shadow-shadow bg-white">
              <CardHeader className="pb-4 pt-5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-heading text-foreground">{batch.name}</h3>
                      <select
                        value={batch.status}
                        onChange={(e) => saveBatch({ ...batch, status: e.target.value })}
                        disabled={loading}
                        className={`text-xs font-base px-2 py-0.5 rounded-base border-2 h-7 cursor-pointer ${
                          batch.status === "In Progress"
                            ? "bg-main/20 border-main text-main-foreground"
                            : batch.status === "Feeding"
                            ? "bg-chart-3/20 border-chart-3 text-chart-3"
                            : "bg-chart-4/20 border-chart-4 text-chart-4"
                        }`}
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Feeding">Feeding</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                    <p className="text-sm font-base text-foreground/60">
                      {batch.startDate} - {batch.targetDate} | {batch.fees} | {batch.cats} cats | {batch.food}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="default" size="sm" onClick={() => setEditingBatch(batch)}>
                      Edit
                    </Button>
                    <Button variant="neutral" size="sm" onClick={() => deleteBatch(batch.id)} disabled={loading}>
                      Delete
                    </Button>
                    <Button
                      variant="neutral"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => toggleBatchExpanded(batch.id)}
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {isExpanded && (
              <CardContent className="pt-5 pb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-base text-foreground/60 block">Receipt ({batch.receiptImages.length})</label>
                    {batch.receiptImages.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {batch.receiptImages.map((img, idx) => (
                          <div key={idx} className="relative w-full aspect-[4/3] border-2 border-border rounded-base overflow-hidden bg-secondary-background">
                            <Image
                              src={img}
                              alt={`Receipt ${idx + 1}`}
                              fill
                              sizes="150px"
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          uploadReceipts(e.target.files, batch.id);
                        }
                      }}
                      className="text-sm"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="space-y-1">
                        <label className="text-xs font-base text-foreground/50 block">Store Name</label>
                        <Input
                          value={batch.receiptStore || ""}
                          onChange={(e) => updateBatchField(batch.id, "receiptStore", e.target.value)}
                          placeholder="Pet Store XYZ"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-base text-foreground/50 block">Item</label>
                        <Input
                          value={batch.receiptItem || ""}
                          onChange={(e) => updateBatchField(batch.id, "receiptItem", e.target.value)}
                          placeholder="Premium Cat Food"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-base text-foreground/50 block">Food Bought</label>
                        <Input
                          value={batch.food || ""}
                          onChange={(e) => updateBatchField(batch.id, "food", e.target.value)}
                          placeholder="4kg"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-base text-foreground/50 block">Total</label>
                        <Input
                          value={batch.receiptTotal || ""}
                          onChange={(e) => updateBatchField(batch.id, "receiptTotal", e.target.value)}
                          placeholder="$10"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-base text-foreground/50 block">Tx Hash</label>
                        <Input
                          value={batch.txHash || ""}
                          onChange={(e) => updateBatchField(batch.id, "txHash", e.target.value)}
                          placeholder="0x..."
                          className="text-sm"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-base text-foreground/50 block">Notes</label>
                      <Textarea
                        value={batch.notes || ""}
                        onChange={(e) => updateBatchField(batch.id, "notes", e.target.value)}
                        placeholder="Purpose of this purchase, e.g. dry food restock"
                        className="text-sm min-h-[72px]"
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="noShadow"
                        size="sm"
                        className="bg-zinc-100 text-foreground hover:bg-zinc-200 border"
                        onClick={() => saveBatch(batch)}
                        disabled={loading}
                      >
                        Save Receipt Details
                      </Button>
                      <Button
                        variant="noShadow"
                        size="sm"
                        className="bg-main/10 text-main-foreground hover:bg-main/20 border"
                        disabled={loading}
                        onClick={async () => {
                          setLoading(true);
                          setMessage(`Posting feeding proof for ${batch.name}...`);
                          try {
                            const res = await fetch("/api/fund-activity/post", {
                              method: "POST",
                              headers: { "Content-Type": "application/json", authorization: `Bearer ${password}` },
                              body: JSON.stringify({ type: "feeding-proof", batchId: batch.id }),
                            });
                            const data = await res.json();
                            setMessage(
                              res.ok && data.ok
                                ? `Feeding proof posted to #feeding-proof for ${batch.name}${data.error ? ` (${data.error})` : ""}`
                                : `Failed: ${data.error || "error"}`
                            );
                            await fetchFundLog();
                          } catch {
                            setMessage("Error posting feeding proof");
                          }
                          setLoading(false);
                        }}
                      >
                        Post Feeding Proof
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-base text-foreground/60 block">Feeding Photos ({batch.photos.length})</label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        if (e.target.files) {
                          uploadPhotos(e.target.files, batch.id);
                        }
                      }}
                      className="text-sm"
                    />
                    {batch.photos.length > 0 && (
                      <div className="space-y-2">
                        <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                          {(expandedPhotos.has(batch.id) ? batch.photos : batch.photos.slice(0, 8)).map((photo, idx) => (
                            <div key={idx} className="relative w-full aspect-square border-2 border-border rounded-base overflow-hidden bg-secondary-background">
                              <Image
                                src={getThumbPath(photo)}
                                alt={`Photo ${idx + 1}`}
                                fill
                                sizes="80px"
                                className="object-cover"
                                unoptimized
                                loading="lazy"
                              />
                            </div>
                          ))}
                        </div>
                        {batch.photos.length > 8 && (
                          <Button
                            variant="noShadow"
                            size="sm"
                            className="bg-zinc-100 text-foreground hover:bg-zinc-200 border"
                            onClick={() => {
                              setExpandedPhotos((prev) => {
                                const next = new Set(prev);
                                if (next.has(batch.id)) {
                                  next.delete(batch.id);
                                } else {
                                  next.add(batch.id);
                                }
                                return next;
                              });
                            }}
                          >
                            {expandedPhotos.has(batch.id)
                              ? "Show less"
                              : `View ${batch.photos.length - 8} more`}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Essentials — additional expenses (bowls, supplies, etc.) */}
                <div className="border-t-2 border-border pt-5 mt-2 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-base text-foreground/60 block">
                      Essentials ({batch.essentials?.length || 0}) - additional expenses
                    </label>
                    <Button
                      variant="noShadow"
                      size="sm"
                      className="bg-zinc-100 text-foreground hover:bg-zinc-200 border"
                      onClick={() => addEssential(batch.id)}
                      disabled={loading}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Item
                    </Button>
                  </div>

                  {(batch.essentials || []).length === 0 && (
                    <p className="text-xs font-base text-foreground/40">
                      No additional expenses recorded. Optional: add bowls, containers, or other feeding necessities.
                    </p>
                  )}

                  {(batch.essentials || []).map((essential, idx) => (
                    <div key={idx} className="border-2 border-border rounded-base p-3 space-y-3 bg-secondary-background/30">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-heading text-foreground/70">Item {idx + 1}</span>
                        <Button
                          variant="noShadow"
                          size="sm"
                          className="bg-zinc-100 text-foreground hover:bg-zinc-200 border"
                          onClick={() => removeEssential(batch.id, idx)}
                          disabled={loading}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-base text-foreground/50 block">Name</label>
                          <Input
                            value={essential.name ?? ""}
                            onChange={(e) => updateEssentialField(batch.id, idx, "name", e.target.value)}
                            placeholder="Feeding bowls x5"
                            className="text-sm h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-base text-foreground/50 block">Price</label>
                          <Input
                            value={essential.price ?? ""}
                            onChange={(e) => updateEssentialField(batch.id, idx, "price", e.target.value)}
                            placeholder="$8"
                            className="text-sm h-9"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-base text-foreground/50 block">Tx hash / link</label>
                        <Input
                          value={essential.tx ?? ""}
                          onChange={(e) => updateEssentialField(batch.id, idx, "tx", e.target.value)}
                          placeholder="0x... or https://solscan.io/tx/..."
                          className="text-sm h-9"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        <Button
                          variant="noShadow"
                          size="sm"
                          className="bg-zinc-100 text-foreground hover:bg-zinc-200 border"
                          onClick={() => saveBatch(batch)}
                          disabled={loading}
                        >
                          Save Essentials
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
              </Card>
              {editingBatch && editingBatch.id === batch.id && (
                <BatchEditor
                  batch={editingBatch}
                  onChange={setEditingBatch}
                  onSave={saveBatch}
                  onCancel={() => setEditingBatch(null)}
                  loading={loading}
                />
              )}
            </div>
          );})}
        </div>

        <Card className="border-2 border-border bg-white">
          <CardContent className="p-4 space-y-3">
            <div>
              <h3 className="text-sm font-heading text-foreground">Danger Zone</h3>
              <p className="text-xs font-base text-foreground/60 mt-1">
                Wipe all batches, receipts, fund-activity log, and every uploaded photo (batch, logo, favicon, partners). Settings are kept. Cannot be undone.
              </p>
            </div>
            <Button
              variant="noShadow"
              className="bg-red-600 text-white hover:bg-red-700 border-2 border-border"
              onClick={clearAllData}
              disabled={loading}
            >
              Clear All Data
            </Button>
          </CardContent>
        </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {message && (
            <div className="bg-main border-2 border-border rounded-base px-4 py-3 text-sm font-base text-main-foreground">
              {message}
            </div>
          )}

          <Tabs defaultValue="project" className="w-full">
            <TabsList className="grid w-full max-w-lg grid-cols-6">
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="partners">Partners</TabsTrigger>
              <TabsTrigger value="seo">SEO</TabsTrigger>
              <TabsTrigger value="appearance">Appearance</TabsTrigger>
              <TabsTrigger value="fund">Fund</TabsTrigger>
              <TabsTrigger value="swap">Swap</TabsTrigger>
            </TabsList>

            <TabsContent value="project" className="space-y-6">
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-heading text-foreground">Redis Cache</h3>
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/admin/clear-cache", {
                            method: "POST",
                            headers: { authorization: `Bearer ${password}` },
                          });
                          const data = await res.json();
                          setMessage(data.message || data.error || "Done");
                        } catch {
                          setMessage("Failed to clear cache");
                        }
                      }}
                    >
                      Clear Cache
                    </Button>
                  </div>
                  <p className="text-[10px] font-base text-foreground/50">
                    Clears all cached data (SOL price, stats, token info, wallets). Data will refresh on next page load.
                  </p>
                </CardContent>
              </Card>

              {/* Maintenance mode */}
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-heading text-foreground">Maintenance Mode</h3>
                      <p className="text-[10px] font-base text-foreground/50 mt-0.5">
                        Hide the site behind an &quot;under maintenance&quot; screen.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMaintenanceMode((v) => !v)}
                      className={`relative h-7 w-12 rounded-full border-2 border-border transition-colors ${maintenanceMode ? "bg-main" : "bg-secondary-background"}`}
                      aria-pressed={maintenanceMode}
                      aria-label="Toggle maintenance mode"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white border-2 border-border transition-transform duration-200 ${maintenanceMode ? "translate-x-[18px]" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-base text-foreground/60 block">Maintenance Message (optional)</label>
                    <Input
                      value={maintenanceMessage}
                      onChange={(e) => setMaintenanceMessage(e.target.value)}
                      placeholder="We're upgrading to serve more cats. Back soon."
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="mt-3"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await fetch("/api/settings", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            authorization: `Bearer ${password}`,
                          },
                          body: JSON.stringify({ maintenanceMode, maintenanceMessage }),
                        });
                        setMessage(res.ok ? "Maintenance setting saved" : "Failed to save");
                      } catch {
                        setMessage("Error saving maintenance setting");
                      }
                      setLoading(false);
                    }}
                  >
                    Save Maintenance
                  </Button>
                </CardContent>
              </Card>

              {/* See Your Impact section toggle */}
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-sm font-heading text-foreground">See Your Impact Section</h3>
                      <p className="text-[10px] font-base text-foreground/50 mt-0.5">
                        Show the &quot;See Your Impact&quot; wallet checker on the homepage.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowImpactSection((v) => !v)}
                      className={`relative h-7 w-12 rounded-full border-2 border-border transition-colors ${showImpactSection ? "bg-main" : "bg-secondary-background"}`}
                      aria-pressed={showImpactSection}
                      aria-label="Toggle See Your Impact section"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white border-2 border-border transition-transform duration-200 ${showImpactSection ? "translate-x-[18px]" : "translate-x-0"}`}
                      />
                    </button>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await fetch("/api/settings", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            authorization: `Bearer ${password}`,
                          },
                          body: JSON.stringify({ showImpactSection }),
                        });
                        setMessage(res.ok ? "Impact section setting saved" : "Failed to save");
                      } catch {
                        setMessage("Error saving impact section setting");
                      }
                      setLoading(false);
                    }}
                  >
                    Save Impact Section
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4">
                  <form onSubmit={saveSettings} className="space-y-6">
                    {/* Core settings */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-heading text-foreground">Project</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-base text-foreground/60 block">Project Name</label>
                          <Input
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            placeholder="e.g. CATFUND"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-base text-foreground/60 block">Token CA</label>
                          <Input
                            value={tokenCa}
                            onChange={(e) => setTokenCa(e.target.value)}
                            placeholder="Solana address"
                            className="w-full"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">Project Logo</label>
                        <div className="flex flex-wrap items-center gap-3">
                          {projectLogo && (
                            <div className="relative w-12 h-12 border-2 border-border rounded-base overflow-hidden bg-secondary-background">
                              <Image
                                src={projectLogo}
                                alt="Project logo preview"
                                fill
                                sizes="48px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadProjectLogo(file);
                            }}
                            className="text-sm w-auto flex-1 min-w-[200px]"
                          />
                          <Input
                            value={projectLogo}
                            onChange={(e) => setProjectLogo(e.target.value)}
                            placeholder="Or paste logo URL"
                            className="text-sm flex-[2] min-w-[200px]"
                          />
                        </div>
                        <p className="text-[10px] font-base text-foreground/50">
                          If set, logo will replace project name text in navbar.
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">Hero Background Image</label>
                        <div className="flex flex-wrap items-center gap-3">
                          {heroBackground && (
                            <div className="relative w-20 h-12 border-2 border-border rounded-base overflow-hidden bg-secondary-background shrink-0">
                              <Image
                                src={heroBackground}
                                alt="Hero background preview"
                                fill
                                sizes="80px"
                                className="object-cover"
                                unoptimized
                              />
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadHeroBackground(file);
                            }}
                            className="text-sm w-auto flex-1 min-w-[200px]"
                          />
                          <Input
                            value={heroBackground}
                            onChange={(e) => setHeroBackground(e.target.value)}
                            placeholder="Or paste image URL"
                            className="text-sm flex-[2] min-w-[200px]"
                          />
                          {heroBackground && (
                            <Button
                              type="button"
                              variant="noShadow"
                              size="sm"
                              className="bg-red-600 text-white hover:bg-red-700 border-2 border-border"
                              onClick={() => setHeroBackground("")}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                        <p className="text-[10px] font-base text-foreground/50">
                          If set, hero section shows this photo with a dark overlay. If empty, uses the default background.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-base text-foreground/60 block">Creator Wallet</label>
                          <Input
                            value={creatorWallet}
                            onChange={(e) => setCreatorWallet(e.target.value)}
                            placeholder="PumpFun creator wallet address (optional)"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-base text-foreground/60 block">Foundation Wallet</label>
                          <Input
                            value={foundationWallet}
                            onChange={(e) => setFoundationWallet(e.target.value)}
                            placeholder="Solana wallet address for fees and donations (optional)"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Social links */}
                    <div className="space-y-4 pt-4 border-t-2 border-border">
                      <h3 className="text-sm font-heading text-foreground">Social Links</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-base text-foreground/60 block">Telegram</label>
                          <Input
                            value={telegram}
                            onChange={(e) => setTelegram(e.target.value)}
                            placeholder="https://t.me/yourusername"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-base text-foreground/60 block">X / Twitter</label>
                          <Input
                            value={twitter}
                            onChange={(e) => setTwitter(e.target.value)}
                            placeholder="https://x.com/yourusername"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-base text-foreground/60 block">Instagram</label>
                          <Input
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="https://instagram.com/yourusername"
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-base text-foreground/60 block">TikTok</label>
                          <Input
                            value={tiktok}
                            onChange={(e) => setTiktok(e.target.value)}
                            placeholder="https://tiktok.com/@yourusername"
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Notification Banner */}
                    <div className="space-y-4 pt-4 border-t-2 border-border">
                      <h3 className="text-sm font-heading text-foreground">Notification Banner</h3>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">
                          Announcement Text
                        </label>
                        <Input
                          value={notificationText}
                          onChange={(e) => setNotificationText(e.target.value)}
                          placeholder="e.g. We just donated 100 bowls of cat food! 🐱"
                          className="w-full"
                        />
                        <p className="text-[10px] font-base text-foreground/50">
                          Shows at the top of every page. Leave empty to hide.
                        </p>
                      </div>
                    </div>

                    <Button type="submit" size="sm" disabled={loading || !tokenCa.trim() || !projectName.trim()}>
                      Save Settings
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="partners" className="space-y-6">
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4">
                  <form onSubmit={saveSettings} className="space-y-6">
                    {/* Partners */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-heading text-foreground">Cats We&apos;ve Helped</h3>
                        <Button type="button" variant="noShadow" size="sm" onClick={addPartner}>
                          <Plus className="w-3 h-3 mr-1" />
                          Add Partner
                        </Button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">Request Support Link</label>
                        <Input
                          value={partnerApplyLink}
                          onChange={(e) => setPartnerApplyLink(e.target.value)}
                          placeholder="https://forms.google.com/... or mailto:help@example.com"
                          className="w-full"
                        />
                        <p className="text-[10px] font-base text-foreground/50">
                          Link untuk tombol &quot;Request support&quot; di landing page.
                        </p>
                      </div>

                      {partners.length === 0 && (
                        <p className="text-xs font-base text-foreground/50">No entries yet.</p>
                      )}

                      <div className="space-y-4">
                        {partners.map((partner, index) => (
                          <div key={index} className="border-2 border-border rounded-base p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-heading text-foreground/60">Partner #{index + 1}</span>
                              <Button
                                type="button"
                                variant="neutral"
                                size="sm"
                                onClick={() => removePartner(index)}
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <Input
                                value={partner.name}
                                onChange={(e) => updatePartner(index, "name", e.target.value)}
                                placeholder="Partner name"
                                className="text-sm"
                              />
                              <Input
                                value={partner.href}
                                onChange={(e) => updatePartner(index, "href", e.target.value)}
                                placeholder="Website link"
                                className="text-sm"
                              />
                            </div>
                            <Input
                              value={partner.description}
                              onChange={(e) => updatePartner(index, "description", e.target.value)}
                              placeholder="Short description"
                              className="text-sm"
                            />
                            <div className="space-y-2">
                              <label className="text-xs font-base text-foreground/50 block">Logo</label>
                              <div className="flex flex-wrap items-center gap-3">
                                {partner.logo && (
                                  <div className="relative w-12 h-12 border-2 border-border rounded-base overflow-hidden bg-secondary-background">
                                    <Image
                                      src={partner.logo}
                                      alt={`${partner.name || "Partner"} logo`}
                                      fill
                                      sizes="48px"
                                      className="object-cover"
                                      unoptimized
                                    />
                                  </div>
                                )}
                                <Input
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadPartnerLogo(index, file);
                                  }}
                                  className="text-sm w-auto flex-1 min-w-[200px]"
                                />
                                <Input
                                  value={partner.logo}
                                  onChange={(e) => updatePartner(index, "logo", e.target.value)}
                                  placeholder="Or paste logo URL"
                                  className="text-sm flex-[2] min-w-[200px]"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <select
                                value={partner.icon}
                                onChange={(e) => updatePartner(index, "icon", e.target.value)}
                                className="h-10 rounded-base border-2 border-border bg-secondary-background px-3 text-sm font-base text-foreground"
                              >
                                <option value="Cat">Cat</option>
                                <option value="Home">Home</option>
                                <option value="PawPrint">PawPrint</option>
                                <option value="Shield">Shield</option>
                                <option value="Heart">Heart</option>
                              </select>
                              <Input
                                value={partner.socials.instagram}
                                onChange={(e) => updatePartnerSocial(index, "instagram", e.target.value)}
                                placeholder="Instagram"
                                className="text-sm"
                              />
                              <Input
                                value={partner.socials.facebook}
                                onChange={(e) => updatePartnerSocial(index, "facebook", e.target.value)}
                                placeholder="Facebook"
                                className="text-sm"
                              />
                              <Input
                                value={partner.socials.tiktok}
                                onChange={(e) => updatePartnerSocial(index, "tiktok", e.target.value)}
                                placeholder="TikTok"
                                className="text-sm"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button type="submit" size="sm" disabled={loading}>
                      Save Settings
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="space-y-6">
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4">
                  <form onSubmit={saveSettings} className="space-y-6">
                    {/* SEO & Metadata */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-heading text-foreground">SEO & Metadata</h3>
                      <p className="text-[10px] font-base text-foreground/50">
                        Used for Google SEO and social media sharing (OG tags). Leave empty to use defaults.
                      </p>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">Meta Title</label>
                        <Input
                          value={seoTitle}
                          onChange={(e) => setSeoTitle(e.target.value)}
                          placeholder={`${projectName || "CatBowl"} - Revolutionary Meme Coin`}
                          className="w-full"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">Meta Description</label>
                        <Textarea
                          value={seoDescription}
                          onChange={(e) => setSeoDescription(e.target.value)}
                          placeholder="Join the future of decentralized finance with CatBowl..."
                          className="w-full min-h-[80px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">Keywords</label>
                        <Input
                          value={seoKeywords}
                          onChange={(e) => setSeoKeywords(e.target.value)}
                          placeholder="cat food, charity, solana, meme coin, donation"
                          className="w-full"
                        />
                        <p className="text-[10px] font-base text-foreground/50">Comma-separated</p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">OG Image URL</label>
                        <Input
                          value={ogImage}
                          onChange={(e) => setOgImage(e.target.value)}
                          placeholder="https://example.com/og-image.png"
                          className="w-full"
                        />
                        <p className="text-[10px] font-base text-foreground/50">
                          Recommended: 1200x630px. Used for social media preview cards.
                        </p>
                        {ogImage && (
                          <div className="mt-2 rounded-base border-2 border-border overflow-hidden">
                            <img src={ogImage} alt="OG preview" className="w-full h-auto" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">Favicon</label>
                        <div className="flex flex-wrap items-center gap-3">
                          {favicon && (
                            <div className="relative w-8 h-8 border-2 border-border rounded-base overflow-hidden bg-secondary-background">
                              <img src={favicon} alt="Favicon preview" className="w-full h-full object-contain" />
                            </div>
                          )}
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadFavicon(file);
                            }}
                            className="text-sm w-auto flex-1 min-w-[200px]"
                          />
                          <Input
                            value={favicon}
                            onChange={(e) => setFavicon(e.target.value)}
                            placeholder="Or paste favicon URL"
                            className="text-sm flex-[2] min-w-[200px]"
                          />
                        </div>
                        <p className="text-[10px] font-base text-foreground/50">
                          Browser tab icon. PNG with transparent background recommended. Recommended: 32x32px or 64x64px.
                        </p>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-base text-foreground/60 block">Histats Embed Code (analytics)</label>
                        <Textarea
                          value={histatsCode}
                          onChange={(e) => setHistatsCode(e.target.value)}
                          placeholder="Paste full embed code from histats.com here"
                          className="text-sm font-mono"
                          rows={6}
                        />
                        <p className="text-[10px] font-base text-foreground/50">
                          From histats.com counter code (the full &lt;script&gt;...&lt;/script&gt; block). Leave empty to disable.
                        </p>
                      </div>
                    </div>

                    <Button type="submit" size="sm" disabled={loading}>
                      Save Settings
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="appearance" className="space-y-6">
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4">
                  <form onSubmit={saveSettings} className="space-y-6">
                    {/* Theme */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-heading text-foreground">Theme</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {themes.map(({ id, label, bg, main }) => (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setTheme(id)}
                            className={`flex flex-col items-center gap-2 p-3 rounded-base border-2 transition-all ${
                              theme === id
                                ? "border-foreground bg-secondary-background"
                                : "border-border bg-white hover:border-foreground/50"
                            }`}
                          >
                            <span
                              className="w-8 h-8 rounded-base border-2 border-border shadow-shadow"
                              style={{ background: `linear-gradient(135deg, ${bg} 50%, ${main} 50%)` }}
                            />
                            <span className="text-xs font-heading text-foreground">{label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Font */}
                    <div className="space-y-4 pt-4 border-t-2 border-border">
                      <div>
                        <h3 className="text-sm font-heading text-foreground">Font</h3>
                        <p className="text-xs font-base text-foreground/60">Pilih font, lalu Save Settings dan refresh homepage.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setFont("default")}
                          className={`relative flex items-center justify-center gap-2 p-3 rounded-base border-2 transition-all ${
                            font === "default"
                              ? "border-main bg-main text-main-foreground shadow-shadow"
                              : "border-border bg-white text-foreground hover:border-foreground/50"
                          }`}
                        >
                          {font === "default" && <Check className="w-4 h-4" />}
                          <span className="text-sm font-heading">Default</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setFont("custom")}
                          className={`relative flex items-center justify-center gap-2 p-3 rounded-base border-2 transition-all ${
                            font === "custom"
                              ? "border-main bg-main text-main-foreground shadow-shadow"
                              : "border-border bg-white text-foreground hover:border-foreground/50"
                          }`}
                        >
                          {font === "custom" && <Check className="w-4 h-4" />}
                          <span className="text-sm font-heading" style={{ fontFamily: "OakSans, sans-serif" }}>OakSans</span>
                        </button>
                      </div>
                    </div>

                    <Button type="submit" size="sm" disabled={loading}>
                      Save Settings
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fund" className="space-y-6">
              {message && (
                <div className="bg-main border-2 border-border rounded-base px-4 py-3 text-sm font-base text-main-foreground">
                  {message}
                </div>
              )}

              {/* Config + Telegram status */}
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-heading text-foreground">Fund Activity Bot</h3>
                      <p className="text-[10px] font-base text-foreground/50 mt-0.5">
                        Auto-post incoming donations & batch status to Telegram.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFundActivityEnabled((v) => !v)}
                      className={`relative h-7 w-12 rounded-full border-2 border-border transition-colors ${fundActivityEnabled ? "bg-main" : "bg-secondary-background"}`}
                      aria-pressed={fundActivityEnabled}
                      aria-label="Toggle fund activity bot"
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white border-2 border-border transition-transform duration-200 ${fundActivityEnabled ? "translate-x-[18px]" : "translate-x-0"}`}
                      />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-base text-foreground/60 block">Min Donation (USD)</label>
                      <Input
                        type="number"
                        min="0"
                        step="0.5"
                        value={fundActivityMinUsd}
                        onChange={(e) => setFundActivityMinUsd(Number(e.target.value) || 0)}
                      />
                      <p className="text-[10px] font-base text-foreground/50">
                        Below this USD value, incoming donations are logged but not posted.
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-base text-foreground/60 block">Poll Interval (seconds)</label>
                      <Input
                        type="number"
                        min="15"
                        step="15"
                        value={fundActivityPollSeconds}
                        onChange={(e) => setFundActivityPollSeconds(Math.max(15, Number(e.target.value) || 60))}
                      />
                      <p className="text-[10px] font-base text-foreground/50">
                        How often the bot checks for new donations & refreshes batch status. Min 15s.
                      </p>
                    </div>
                  </div>

                  {/* Telegram env status */}
                  <div className="rounded-base border-2 border-border bg-secondary-background/50 p-3">
                    <p className="text-[10px] font-heading text-foreground/50 uppercase tracking-wider mb-2">
                      Telegram Config (.env)
                    </p>
                    <div className="flex flex-wrap gap-2 text-[11px] font-base">
                      <span className={`px-2 py-0.5 rounded-base border ${fundTelegram?.bot ? "bg-chart-4/20 border-chart-4 text-foreground" : "bg-secondary-background border-border text-foreground/50"}`}>
                        BOT_TOKEN {fundTelegram?.bot ? "✓" : "✕"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-base border ${fundTelegram?.chat ? "bg-chart-4/20 border-chart-4 text-foreground" : "bg-secondary-background border-border text-foreground/50"}`}>
                        CHAT_ID {fundTelegram?.chat ? "✓" : "✕"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-base border ${fundTelegram?.fundTopic ? "bg-chart-4/20 border-chart-4 text-foreground" : "bg-secondary-background border-border text-foreground/50"}`}>
                        FUND_TOPIC {fundTelegram?.fundTopic ? "✓" : "✕"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-base border ${fundTelegram?.batchTopic ? "bg-chart-4/20 border-chart-4 text-foreground" : "bg-secondary-background border-border text-foreground/50"}`}>
                        BATCH_TOPIC {fundTelegram?.batchTopic ? "✓" : "✕"}
                      </span>
                      <span className={`px-2 py-0.5 rounded-base border ${fundTelegram?.feedingProofTopic ? "bg-chart-4/20 border-chart-4 text-foreground" : "bg-secondary-background border-border text-foreground/50"}`}>
                        FEEDING_PROOF_TOPIC {fundTelegram?.feedingProofTopic ? "✓" : "✕"}
                      </span>
                    </div>

                    <Button
                      type="button"
                      variant="noShadow"
                      size="sm"
                      className="bg-zinc-100 text-foreground hover:bg-zinc-200 border"
                      onClick={async () => {
                        try {
                          const res = await fetch("/api/fund-activity/debug", {
                            cache: "no-store",
                            headers: { authorization: `Bearer ${password}` },
                          });
                          const data = await res.json();
                          setFundDebug(data);
                        } catch {
                          setFundDebug({ ok: false, error: "request-failed" });
                        }
                      }}
                    >
                      Detect Telegram IDs
                    </Button>

                    {fundDebug && (
                      <div className="rounded-base border-2 border-border bg-background p-3 text-[11px] font-base">
                        {!fundDebug.ok ? (
                          <p className="text-foreground/60">
                            {fundDebug.error}. Pastikan bot udah ditambahin ke grup sebagai admin &amp; ada pesan di tiap topic, lalu coba lagi.
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {fundDebug.chats?.map((c) => (
                              <div key={c.id}>
                                <p className="font-heading text-foreground">
                                  {c.title} <span className="text-foreground/50">→ CHAT_ID = {c.id}</span>
                                </p>
                                {c.topics.length > 0 && (
                                  <ul className="mt-1 space-y-0.5 text-foreground/60">
                                    {c.topics.map((t) => (
                                      <li key={t.threadId}>
                                        {t.name} → TOPIC_ID = {t.threadId}
                                      </li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      size="sm"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const res = await fetch("/api/settings", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", authorization: `Bearer ${password}` },
                            body: JSON.stringify({ fundActivityEnabled, fundActivityMinUsd, fundActivityPollSeconds }),
                          });
                          setMessage(res.ok ? "Fund activity config saved" : "Failed to save");
                        } catch {
                          setMessage("Error saving fund activity config");
                        }
                        setLoading(false);
                      }}
                    >
                      Save Config
                    </Button>
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        setMessage("Posting batch status...");
                        try {
                          const res = await fetch("/api/fund-activity/test-batch", {
                            method: "POST",
                            headers: { authorization: `Bearer ${password}` },
                          });
                          const data = await res.json();
                          setMessage(
                            res.ok && data.ok
                              ? "Batch status posted to #current-batch"
                              : `Failed: ${data.error || "error"}`
                          );
                          await fetchFundLog();
                        } catch {
                          setMessage("Error posting batch status");
                        }
                        setLoading(false);
                      }}
                    >
                      Test Batch Post
                    </Button>
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        setMessage("Running check...");
                        try {
                          const res = await fetch("/api/fund-activity/check", {
                            method: "POST",
                            headers: { authorization: `Bearer ${password}` },
                          });
                          const data = await res.json();
                          setMessage(
                            res.ok
                              ? `Check done: ${data.donationsPosted} posted, ${data.donationsSkipped} skipped, batch ${data.batchUpdated ? "updated" : "no change"}`
                              : `Failed: ${data.error || "error"}`
                          );
                          await fetchFundLog();
                        } catch {
                          setMessage("Error running check");
                        }
                        setLoading(false);
                      }}
                    >
                      Run Check Now
                    </Button>
                    <Button
                      type="button"
                      variant="neutral"
                      size="sm"
                      onClick={() => fetchFundLog()}
                    >
                      Refresh Log
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Manual posts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Tipe A — Rewards */}
                <Card className="border-2 border-border shadow-shadow bg-white">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-heading text-foreground">Manual: Rewards (Tipe A)</h3>
                      <p className="text-[10px] font-base text-foreground/50 mt-0.5">
                        Post a creator-rewards transfer (creator → foundation).
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-base text-foreground/60 block">SOL</label>
                        <Input value={rwSol} onChange={(e) => setRwSol(e.target.value)} placeholder="2.45" className="text-sm h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-base text-foreground/60 block">USD (optional)</label>
                        <Input value={rwUsd} onChange={(e) => setRwUsd(e.target.value)} placeholder="420" className="text-sm h-9" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-base text-foreground/60 block">Tx hash / link</label>
                        <Input value={rwTx} onChange={(e) => setRwTx(e.target.value)} placeholder="0x... or https://solscan.io/tx/..." className="text-sm h-9" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-base text-foreground/60 block">Batch / note</label>
                        <Input value={rwBatch} onChange={(e) => setRwBatch(e.target.value)} placeholder="Batch #6" className="text-sm h-9" />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const res = await fetch("/api/fund-activity/post", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", authorization: `Bearer ${password}` },
                            body: JSON.stringify({
                              type: "rewards",
                              amountSol: rwSol ? Number(rwSol) : undefined,
                              amountUsd: rwUsd ? Number(rwUsd) : undefined,
                              txHash: rwTx || undefined,
                              batch: rwBatch || undefined,
                            }),
                          });
                          const data = await res.json();
                          setMessage(res.ok && data.ok ? "Rewards posted to #fund-activity" : `Failed: ${data.error || "error"}`);
                          if (data.ok) { setRwSol(""); setRwUsd(""); setRwTx(""); setRwBatch(""); }
                          await fetchFundLog();
                        } catch {
                          setMessage("Error posting rewards");
                        }
                        setLoading(false);
                      }}
                    >
                      Post Rewards
                    </Button>
                  </CardContent>
                </Card>

                {/* Tipe B — Purchase */}
                <Card className="border-2 border-border shadow-shadow bg-white">
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="text-sm font-heading text-foreground">Manual: Food Purchase (Tipe B)</h3>
                      <p className="text-[10px] font-base text-foreground/50 mt-0.5">
                        Post a food purchase (foundation outgoing).
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-base text-foreground/60 block">Store</label>
                        <Input value={prStore} onChange={(e) => setPrStore(e.target.value)} placeholder="Pet Shop XYZ" className="text-sm h-9" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-base text-foreground/60 block">Total (USD)</label>
                        <Input value={prUsd} onChange={(e) => setPrUsd(e.target.value)} placeholder="380" className="text-sm h-9" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-base text-foreground/60 block">Item</label>
                        <Input value={prItem} onChange={(e) => setPrItem(e.target.value)} placeholder="25kg Premium Cat Food" className="text-sm h-9" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-base text-foreground/60 block">Tx hash / link</label>
                        <Input value={prTx} onChange={(e) => setPrTx(e.target.value)} placeholder="0x... or https://solscan.io/tx/..." className="text-sm h-9" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-base text-foreground/60 block">Receipt URL</label>
                        <Input value={prReceipt} onChange={(e) => setPrReceipt(e.target.value)} placeholder="https://... or /uploads/..." className="text-sm h-9" />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-base text-foreground/60 block">Batch / note</label>
                        <Input value={prBatch} onChange={(e) => setPrBatch(e.target.value)} placeholder="Batch #6" className="text-sm h-9" />
                      </div>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      disabled={loading}
                      onClick={async () => {
                        setLoading(true);
                        try {
                          const res = await fetch("/api/fund-activity/post", {
                            method: "POST",
                            headers: { "Content-Type": "application/json", authorization: `Bearer ${password}` },
                            body: JSON.stringify({
                              type: "purchase",
                              store: prStore || undefined,
                              item: prItem || undefined,
                              totalUsd: prUsd ? Number(prUsd) : undefined,
                              txHash: prTx || undefined,
                              receiptUrl: prReceipt || undefined,
                              batch: prBatch || undefined,
                            }),
                          });
                          const data = await res.json();
                          setMessage(res.ok && data.ok ? "Purchase posted to #fund-activity" : `Failed: ${data.error || "error"}`);
                          if (data.ok) { setPrStore(""); setPrItem(""); setPrUsd(""); setPrTx(""); setPrReceipt(""); setPrBatch(""); }
                          await fetchFundLog();
                        } catch {
                          setMessage("Error posting purchase");
                        }
                        setLoading(false);
                      }}
                    >
                      Post Purchase
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-base border-2 border-border bg-white p-3 text-center">
                  <p className="text-[10px] font-base text-foreground/50">Posted</p>
                  <p className="text-xl font-heading text-chart-4">{fundLog.filter((l) => l.status === "posted").length}</p>
                </div>
                <div className="rounded-base border-2 border-border bg-white p-3 text-center">
                  <p className="text-[10px] font-base text-foreground/50">Skipped</p>
                  <p className="text-xl font-heading text-foreground/60">
                    {fundLog.filter((l) => l.status.startsWith("skipped")).length}
                  </p>
                </div>
                <div className="rounded-base border-2 border-border bg-white p-3 text-center">
                  <p className="text-[10px] font-base text-foreground/50">Errors</p>
                  <p className="text-xl font-heading text-foreground/60">{fundLog.filter((l) => l.status === "error").length}</p>
                </div>
              </div>

              {/* Log table */}
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-0">
                  <div className="max-h-[360px] overflow-auto">
                  <table className="w-full text-xs font-base">
                    <thead className="sticky top-0 z-10">
                      <tr className="border-b-2 border-border text-left text-foreground/50 bg-white">
                        <th className="p-3 font-heading">Date</th>
                        <th className="p-3 font-heading">Type</th>
                        <th className="p-3 font-heading">Token</th>
                        <th className="p-3 font-heading">Amount</th>
                        <th className="p-3 font-heading">USD</th>
                        <th className="p-3 font-heading">Status</th>
                        <th className="p-3 font-heading">Tx</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fundLog.length === 0 && (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-foreground/40">
                            No fund activity yet. Enable the bot & run a check.
                          </td>
                        </tr>
                      )}
                      {fundLog.map((l) => (
                        <tr key={l.id} className="border-b border-border/50 align-top">
                          <td className="p-3 text-foreground/60 whitespace-nowrap">
                            {new Date(l.ts * 1000).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </td>
                          <td className="p-3 text-foreground">{l.type}</td>
                          <td className="p-3 text-foreground">{l.token}</td>
                          <td className="p-3 text-foreground tabular-nums">{l.amount ?? "-"}</td>
                          <td className="p-3 text-foreground tabular-nums">{l.usdValue != null ? `$${l.usdValue.toLocaleString("en-US")}` : "-"}</td>
                          <td className="p-3">
                            <span className={`px-1.5 py-0.5 rounded-base border text-[10px] ${
                              l.status === "posted" ? "bg-chart-4/20 border-chart-4 text-foreground"
                              : l.status === "error" ? "bg-red-500/10 border-red-500/40 text-foreground"
                              : "bg-secondary-background border-border text-foreground/60"
                            }`}>
                              {l.status}
                            </span>
                          </td>
                          <td className="p-3">
                            {l.txHash ? (
                              <a href={`https://solscan.io/tx/${l.txHash}`} target="_blank" rel="noopener noreferrer" className="text-main underline underline-offset-2">
                                view
                              </a>
                            ) : "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  </div>
                </CardContent>
              </Card>

              {/* Templates */}
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4 space-y-4">
                  <div>
                    <h3 className="text-sm font-heading text-foreground">Telegram Templates</h3>
                    <p className="text-[10px] font-base text-foreground/50 mt-0.5">
                      Edit format pesan yang dikirim ke Telegram. Pakai placeholder <code className="text-main">{"{placeholder}"}</code> — typo placeholder bakal tampil apa adanya.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-heading text-foreground">Donation Received</label>
                      <textarea
                        value={tplDonation}
                        onChange={(e) => setTplDonation(e.target.value)}
                        rows={6}
                        className="w-full rounded-base border-2 border-border bg-secondary-background p-2 text-[11px] font-base text-foreground resize-y"
                      />
                      <p className="text-[10px] font-base text-foreground/40">placeholders: date, amount, token, usd, tx, sender</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-heading text-foreground">Creator Rewards (Tipe A)</label>
                      <textarea
                        value={tplRewards}
                        onChange={(e) => setTplRewards(e.target.value)}
                        rows={6}
                        className="w-full rounded-base border-2 border-border bg-secondary-background p-2 text-[11px] font-base text-foreground resize-y"
                      />
                      <p className="text-[10px] font-base text-foreground/40">placeholders: date, amount, usd, tx, batch</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-heading text-foreground">Food Purchase (Tipe B)</label>
                      <textarea
                        value={tplPurchase}
                        onChange={(e) => setTplPurchase(e.target.value)}
                        rows={8}
                        className="w-full rounded-base border-2 border-border bg-secondary-background p-2 text-[11px] font-base text-foreground resize-y"
                      />
                      <p className="text-[10px] font-base text-foreground/40">placeholders: date, amount, store, item, receipt, tx, batch</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-heading text-foreground">Current Batch</label>
                      <textarea
                        value={tplBatch}
                        onChange={(e) => setTplBatch(e.target.value)}
                        rows={6}
                        className="w-full rounded-base border-2 border-border bg-secondary-background p-2 text-[11px] font-base text-foreground resize-y"
                      />
                      <p className="text-[10px] font-base text-foreground/40">placeholders: name, id, status, period, rewards, bowls</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-heading text-foreground">Feeding Proof</label>
                      <textarea
                        value={tplFeedingProof}
                        onChange={(e) => setTplFeedingProof(e.target.value)}
                        rows={8}
                        className="w-full rounded-base border-2 border-border bg-secondary-background p-2 text-[11px] font-base text-foreground resize-y"
                      />
                      <p className="text-[10px] font-base text-foreground/40">placeholders: name, store, item, total, date, cats, food, fees, tx, receiptUrl</p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    disabled={loading}
                    onClick={async () => {
                      setLoading(true);
                      try {
                        const res = await fetch("/api/settings", {
                          method: "POST",
                          headers: { "Content-Type": "application/json", authorization: `Bearer ${password}` },
                          body: JSON.stringify({ tplDonation, tplRewards, tplPurchase, tplBatch, tplFeedingProof }),
                        });
                        setMessage(res.ok ? "Templates saved" : "Failed to save templates");
                      } catch {
                        setMessage("Error saving templates");
                      }
                      setLoading(false);
                    }}
                  >
                    Save Templates
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="swap" className="space-y-6">
              <Card className="border-2 border-border shadow-shadow bg-white">
                <CardContent className="p-4">
                  <form onSubmit={saveSettings} className="space-y-4">
                    <div>
                      <h3 className="text-sm font-heading text-foreground">Swap Fee</h3>
                      <p className="text-xs font-base text-foreground/60 mt-1">
                        Fee charged on every swap at /swap. It goes to the foundation wallet and becomes cat food. Default 1% (100 bps).
                      </p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-base text-foreground/60 block">Swap Fee (%)</label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={(swapFeeBps / 100).toString()}
                        onChange={(e) => {
                          const v = Number(e.target.value);
                          if (!isNaN(v)) setSwapFeeBps(Math.min(10000, Math.max(0, Math.round(v * 100))));
                        }}
                        className="text-sm"
                      />
                      <p className="text-[10px] font-base text-foreground/50">
                        {swapFeeBps} bps = {swapFeeBps / 100}%. 0% disables the fee. Max 100%.
                      </p>
                    </div>
                    <p className="text-[10px] font-base text-foreground/50">
                      Token contract and fee wallet are set in the Project tab (Token CA + Foundation Wallet).
                    </p>
                    <Button type="submit" size="sm" disabled={loading}>
                      Save Settings
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
