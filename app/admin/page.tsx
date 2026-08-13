"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import Image from "next/image";
import { getThumbPath } from "@/lib/utils";
import { ChevronDown, Cat, Home, PawPrint, Shield, Heart, Plus, Trash2 } from "lucide-react";
import { type Partner } from "@/lib/settings";
import { themes, type Theme } from "@/components/theme-provider";

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
            <label className="text-xs font-base text-foreground/60 block">Creator Rewards (USD)</label>
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
          <div className="space-y-1.5">
            <label className="text-xs font-base text-foreground/60 block">Food Bought</label>
            <Input
              value={batch.food}
              onChange={(e) => onChange({ ...batch, food: e.target.value })}
              placeholder="0kg"
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
  const [topDonorsLoading, setTopDonorsLoading] = useState(false);
  const [topDonorsMessage, setTopDonorsMessage] = useState("");
  const [tokenCa, setTokenCa] = useState("");
  const [projectName, setProjectName] = useState("");
  const [projectLogo, setProjectLogo] = useState("");
  const [creatorWallet, setCreatorWallet] = useState("");
  const [foundationWallet, setFoundationWallet] = useState("");
  const [telegram, setTelegram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [partnerApplyLink, setPartnerApplyLink] = useState("");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [theme, setTheme] = useState<Theme>("original");
  const [notificationText, setNotificationText] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState("");
  const [ogImage, setOgImage] = useState("");
  const [favicon, setFavicon] = useState("");

  useEffect(() => {
    const storedPassword = sessionStorage.getItem("adminPassword");
    if (storedPassword) {
      setPassword(storedPassword);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBatches();
      fetchSettings();
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
      setCreatorWallet(data.creatorWallet || "");
      setFoundationWallet(data.foundationWallet || "");
      setTelegram(data.telegram || "");
      setTwitter(data.twitter || "");
      setInstagram(data.instagram || "");
      setTiktok(data.tiktok || "");
      setPartnerApplyLink(data.partnerApplyLink || "");
      setPartners(Array.isArray(data.partners) ? data.partners : []);
      setTheme(data.theme && ["original", "mint", "lavender", "lemon"].includes(data.theme) ? data.theme : "original");
      setNotificationText(data.notificationText || "");
      setSeoTitle(data.seoTitle || "");
      setSeoDescription(data.seoDescription || "");
      setSeoKeywords(data.seoKeywords || "");
      setOgImage(data.ogImage || "");
      setFavicon(data.favicon || "");
    } catch {
      setMessage("Failed to load settings");
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
          creatorWallet,
          foundationWallet,
          telegram,
          twitter,
          instagram,
          tiktok,
          partnerApplyLink,
          partners,
          theme,
          notificationText,
          seoTitle,
          seoDescription,
          seoKeywords,
          ogImage,
          favicon,
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
    const path = await uploadSingleFile(file, "logo", "photo");
    if (path) {
      setProjectLogo(path);
      setMessage("Project logo uploaded");
    } else {
      setMessage("Project logo upload failed");
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

  async function updateTopDonors() {
    setTopDonorsLoading(true);
    setTopDonorsMessage("");
    try {
      const res = await fetch("/api/admin/update-top-donors", {
        cache: "no-store",
        headers: { authorization: `Bearer ${password}` },
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setTopDonorsMessage(`Updated ${data.count || 0} top donors successfully`);
      } else {
        setTopDonorsMessage(data.error || "Failed to update top donors");
      }
    } catch {
      setTopDonorsMessage("Error updating top donors");
    }
    setTopDonorsLoading(false);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/batches", {
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
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="batches">Batches</TabsTrigger>
            <TabsTrigger value="top-donors">Top Donors</TabsTrigger>
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
              <p className="text-sm font-base text-foreground/50">No batches yet. Click "New Batch" to create one.</p>
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
                        placeholder="Purpose of this purchase, e.g. weekly dry food restock"
                        className="text-sm min-h-[72px]"
                      />
                    </div>
                    <Button
                      variant="noShadow"
                      size="sm"
                      className="bg-zinc-100 text-foreground hover:bg-zinc-200 border"
                      onClick={() => saveBatch(batch)}
                      disabled={loading}
                    >
                      Save Receipt Details
                    </Button>
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
        </TabsContent>

        <TabsContent value="top-donors" className="space-y-6">
          {topDonorsMessage && (
            <div className="bg-main border-2 border-border rounded-base px-4 py-3 text-sm font-base text-main-foreground">
              {topDonorsMessage}
            </div>
          )}

          <Card className="border-2 border-border shadow-shadow bg-white">
            <CardContent className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-heading text-foreground">Top Donors Data</h3>
                <p className="text-sm font-base text-foreground/60">
                  Refresh top traders from GMGN using the token contract address. Updates are also run automatically every 6 hours.
                </p>
              </div>
              <Button
                onClick={updateTopDonors}
                disabled={topDonorsLoading}
                variant="reverse"
              >
                {topDonorsLoading ? "Updating..." : "Refresh Top Donors"}
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

                {/* SEO & Metadata */}
                <div className="space-y-4 pt-4 border-t-2 border-border">
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
                    <label className="text-xs font-base text-foreground/60 block">Favicon URL</label>
                    <Input
                      value={favicon}
                      onChange={(e) => setFavicon(e.target.value)}
                      placeholder="/favicon.ico or https://example.com/favicon.png"
                      className="w-full"
                    />
                    <p className="text-[10px] font-base text-foreground/50">
                      Browser tab icon. Use .ico, .png, or .svg. Recommended: 32x32px or 64x64px.
                    </p>
                    {favicon && (
                      <div className="mt-2 flex items-center gap-2">
                        <img src={favicon} alt="Favicon preview" className="w-8 h-8 rounded-base border-2 border-border" />
                        <span className="text-[10px] font-base text-foreground/50">Preview</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Theme */}
                <div className="space-y-4 pt-4 border-t-2 border-border">
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

                {/* Partners */}
                <div className="space-y-4 pt-4 border-t-2 border-border">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-heading text-foreground">Rescue Partners</h3>
                    <Button type="button" variant="noShadow" size="sm" onClick={addPartner}>
                      <Plus className="w-3 h-3 mr-1" />
                      Add Partner
                    </Button>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-base text-foreground/60 block">Partner Application Link</label>
                    <Input
                      value={partnerApplyLink}
                      onChange={(e) => setPartnerApplyLink(e.target.value)}
                      placeholder="https://forms.google.com/... or mailto:partner@example.com"
                      className="w-full"
                    />
                    <p className="text-[10px] font-base text-foreground/50">
                      Link untuk tombol &quot;Become a Partner&quot; di landing page.
                    </p>
                  </div>

                  {partners.length === 0 && (
                    <p className="text-xs font-base text-foreground/50">No partners added yet.</p>
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

                <Button type="submit" size="sm" disabled={loading || !tokenCa.trim() || !projectName.trim()}>
                  Save Settings
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
