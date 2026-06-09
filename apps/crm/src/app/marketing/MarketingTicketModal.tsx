'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@repo/ui/dialog';
import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import { Label } from "@repo/ui/label";
import { Textarea } from "@repo/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@repo/ui/select";
import { useCrmAuth } from '@/hooks/useCrmAuth';
import { Ticket, Users, CheckCircle2, X, Building2, Phone, Mail, User, FileText, AlignLeft, ChevronRight } from 'lucide-react';

type MarketingPackage = {
  _id: string;
  name: string;
  price: number;
  description?: string;
  features?: string[];
  platforms?: string[];
};

type MarketingAgent = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
};

type MarketingTicketModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTicketCreated: () => void;
  preSelectedPackage?: MarketingPackage | null;
};

export default function MarketingTicketModal({
  open,
  onOpenChange,
  onTicketCreated,
  preSelectedPackage,
}: MarketingTicketModalProps) {
  const { user } = useCrmAuth();

  const [packages, setPackages] = useState<MarketingPackage[]>([]);
  const [agents, setAgents] = useState<MarketingAgent[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    packageId: '',
    agentId: '',
    subject: '',
    description: ''
  });

  useEffect(() => {
    if (open) {
      const fetchMetadata = async () => {
        setLoadingMetadata(true);
        try {
          const requests: Promise<Response>[] = [fetch('/api/crm/marketing/agents')];
          if (!preSelectedPackage) {
            requests.unshift(fetch('/api/crm/marketing/packages'));
          }
          const results = await Promise.all(requests);
          if (!preSelectedPackage) {
            const [resPkg, resAgt] = results;
            if (resPkg.ok) { const d = await resPkg.json(); setPackages(d.data || []); }
            if (resAgt.ok) { const d = await resAgt.json(); setAgents(d.data || []); }
          } else {
            const [resAgt] = results;
            if (resAgt.ok) { const d = await resAgt.json(); setAgents(d.data || []); }
          }
        } catch {
          toast.error("Failed to load data. Please try again.");
        } finally {
          setLoadingMetadata(false);
        }
      };
      fetchMetadata();
      setFormData({ packageId: preSelectedPackage?._id || '', agentId: '', subject: '', description: '' });
    }
  }, [open, preSelectedPackage]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.packageId || !formData.subject.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        agentId: formData.agentId === 'none' || !formData.agentId ? null : formData.agentId,
      };
      const res = await fetch('/api/crm/marketing/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success("Marketing ticket created successfully!");
        onTicketCreated();
        onOpenChange(false);
      } else {
        throw new Error(data.message || "Something went wrong");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit ticket.");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAgent = agents.find(a => a._id === formData.agentId);
  const agentInitials = selectedAgent
    ? selectedAgent.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : null;

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Vendor';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col">

        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="bg-slate-900 px-6 py-5 flex items-start justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Ticket className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold leading-tight">Generate Marketing Ticket</h2>
              <p className="text-slate-400 text-xs mt-0.5">Request customized design materials, ad creation, or expert help.</p>
            </div>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-slate-400 hover:text-white transition-colors mt-0.5"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Scrollable Body ─────────────────────────────────────── */}
        <div className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit}>

            {/* ── Vendor Info ───────────────────────────────────────── */}
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Your Business Info</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2, label: 'Business Name', value: user?.businessName || 'Your Salon' },
                  { icon: User,      label: 'Contact Name',  value: fullName },
                  { icon: Mail,      label: 'Email',         value: user?.emailAddress || user?.email || 'N/A' },
                  { icon: Phone,     label: 'Phone',         value: user?.mobileNo || user?.phone || 'N/A' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-200 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-3.5 w-3.5 text-slate-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Package Section ───────────────────────────────────── */}
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Marketing Package</p>

              {preSelectedPackage ? (
                /* Pre-selected package card */
                <div className="rounded-xl border border-slate-200 overflow-hidden">
                  {/* Package header strip */}
                  <div className="bg-slate-900 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                      <span className="text-white font-bold text-sm">{preSelectedPackage.name}</span>
                    </div>
                    <span className="text-white font-bold text-sm bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full">
                      ₹{preSelectedPackage.price.toLocaleString('en-IN')}
                    </span>
                  </div>
                  {/* Package body */}
                  <div className="px-4 py-3 bg-white">
                    {preSelectedPackage.description && (
                      <p className="text-xs text-slate-500 mb-3">{preSelectedPackage.description}</p>
                    )}
                    {preSelectedPackage.features && preSelectedPackage.features.length > 0 && (
                      <div className="grid grid-cols-2 gap-1.5">
                        {preSelectedPackage.features.map((f, i) => (
                          <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                            <div className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />
                            {f}
                          </div>
                        ))}
                      </div>
                    )}
                    {preSelectedPackage.platforms && preSelectedPackage.platforms.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-100">
                        {preSelectedPackage.platforms.map((p) => (
                          <span key={p} className="text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded-full">
                            {p}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* Package dropdown */
                loadingMetadata ? (
                  <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse" />
                ) : (
                  <Select
                    value={formData.packageId}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, packageId: val }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 h-11 rounded-xl">
                      <SelectValue placeholder="Choose a marketing package…" />
                    </SelectTrigger>
                    <SelectContent>
                      {packages.map((pkg) => (
                        <SelectItem key={pkg._id} value={pkg._id}>
                          <div className="flex items-center justify-between gap-4 w-full">
                            <span>{pkg.name}</span>
                            <span className="text-slate-400 text-xs">₹{pkg.price.toLocaleString('en-IN')}</span>
                          </div>
                        </SelectItem>
                      ))}
                      {packages.length === 0 && (
                        <SelectItem value="none" disabled>No packages available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                )
              )}
            </div>

            {/* ── Agent Section ─────────────────────────────────────── */}
            <div className="px-6 py-5 border-b border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                Assign Agent <span className="normal-case font-normal text-slate-400">(Optional)</span>
              </p>
              {loadingMetadata ? (
                <div className="h-11 w-full bg-slate-100 rounded-xl animate-pulse" />
              ) : (
                <div className="space-y-2">
                  <Select
                    value={formData.agentId}
                    onValueChange={(val) => setFormData(prev => ({ ...prev, agentId: val }))}
                  >
                    <SelectTrigger className="bg-white border-slate-200 h-11 rounded-xl">
                      <SelectValue placeholder="Choose preferred agent or auto-assign…" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center">
                            <Users className="h-3 w-3 text-slate-500" />
                          </div>
                          <span className="text-slate-500">Auto-assign agent</span>
                        </div>
                      </SelectItem>
                      {agents.map((agt) => (
                        <SelectItem key={agt._id} value={agt._id}>
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-slate-900 flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0">
                              {agt.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                            </div>
                            {agt.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Selected agent preview */}
                  {selectedAgent && (
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                      <div className="h-8 w-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {agentInitials}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-800">{selectedAgent.name}</p>
                        <p className="text-[10px] text-slate-500">{selectedAgent.email}</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Request Details ───────────────────────────────────── */}
            <div className="px-6 py-5 space-y-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Request Details</p>

              {/* Subject */}
              <div className="space-y-1.5">
                <Label htmlFor="subject" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  Subject / Brief Title
                  <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Input
                  id="subject"
                  placeholder="e.g. Diwali promo banner design"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  maxLength={100}
                  required
                  className="bg-white border-slate-200 h-11 rounded-xl text-sm placeholder:text-slate-400 focus-visible:ring-slate-900"
                />
                <p className="text-[10px] text-slate-400 text-right">{formData.subject.length}/100</p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <AlignLeft className="h-3.5 w-3.5 text-slate-400" />
                  Describe Your Request
                  <span className="text-red-500 ml-0.5">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide design text, references, color preferences, target audience, offer details, deadline, etc…"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  required
                  className="bg-white border-slate-200 rounded-xl text-sm placeholder:text-slate-400 resize-none focus-visible:ring-slate-900"
                />
              </div>
            </div>

            {/* ── Footer ────────────────────────────────────────────── */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="text-red-400">*</span> Required fields
              </p>
              <div className="flex items-center gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={submitting}
                  className="border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl h-10 px-5 text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting || !formData.packageId || !formData.subject.trim() || !formData.description.trim()}
                  className="bg-slate-900 hover:bg-slate-700 text-white rounded-xl h-10 px-5 text-sm gap-2 disabled:opacity-40"
                >
                  {submitting ? (
                    <>
                      <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      Generate Ticket
                      <ChevronRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>

          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
