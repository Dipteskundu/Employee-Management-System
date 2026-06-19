"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Building2, Plus, MapPin, Wifi, Edit2, Trash2, CircleDot, Loader2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useOffices, useCreateOffice, useUpdateOffice, useDeleteOffice } from "@/hooks/useOffices";
import { useEmployees } from "@/hooks/useEmployees";
import { toast } from "sonner";

export default function AdminOfficesPage() {
  const { data, isLoading } = useOffices();
  const { data: employeesData } = useEmployees();
  const createMutation = useCreateOffice();
  const updateMutation = useUpdateOffice();
  const deleteMutation = useDeleteOffice();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ office_name: "", static_ip: "", latitude: "", longitude: "", allowed_radius: 50 });

  const offices = data?.offices || [];
  const employees = employeesData?.employees || [];

  const resetForm = () => {
    setForm({ office_name: "", static_ip: "", latitude: "", longitude: "", allowed_radius: 50 });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.office_name || !form.static_ip || !form.latitude || !form.longitude) {
      toast.error("Please fill in all required fields");
      return;
    }
    try {
      const payload = { ...form, latitude: parseFloat(form.latitude), longitude: parseFloat(form.longitude), allowed_radius: Number(form.allowed_radius) };
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, data: payload });
        toast.success("Office updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Office created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    }
  };

  const handleEdit = (office: any) => {
    setForm({
      office_name: office.office_name,
      static_ip: office.static_ip,
      latitude: String(office.latitude),
      longitude: String(office.longitude),
      allowed_radius: office.allowed_radius,
    });
    setEditingId(office._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this office?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Office deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  const getEmployeeCount = (officeId: string) =>
    employees.filter((e: any) => e.assigned_office_id === officeId || e.assigned_office_id?._id === officeId).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Building2 className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Offices</h1>
            <p className="text-muted-foreground">Manage office locations and IP ranges</p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-primary text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Office
        </Button>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Offices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{offices.length}</div>
            <p className="text-xs text-muted-foreground">All locations</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">{offices.length}</div>
            <p className="text-xs text-muted-foreground">Configured locations</p>
          </CardContent>
        </Card>
        <Card className="shadow-premium">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Employees</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employees.length}</div>
            <p className="text-xs text-muted-foreground">Across all offices</p>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border/40 shadow-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingId ? "Edit Office" : "Add New Office"}</h3>
            <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Office Name *</label>
              <Input value={form.office_name} onChange={(e) => setForm({ ...form, office_name: e.target.value })} placeholder="Main Office" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Static IP *</label>
              <Input value={form.static_ip} onChange={(e) => setForm({ ...form, static_ip: e.target.value })} placeholder="192.168.1.0" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Allowed Radius (m)</label>
              <Input type="number" value={form.allowed_radius} onChange={(e) => setForm({ ...form, allowed_radius: Number(e.target.value) })} min={10} max={1000} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Latitude *</label>
              <Input value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} placeholder="40.7128" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Longitude *</label>
              <Input value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} placeholder="-74.0060" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit} className="gradient-primary text-white" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update Office" : "Create Office"}
            </Button>
          </div>
        </motion.div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {offices.map((office: any, i: number) => (
          <motion.div
            key={office._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <Card className="shadow-premium hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{office.office_name}</CardTitle>
                    </div>
                  </div>
                  <Badge className="gradient-success text-white">
                    <CircleDot className="h-3 w-3 mr-1" />
                    active
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-muted-foreground" />
                  <span className="font-mono text-xs">{office.static_ip}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs">{office.latitude}, {office.longitude}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Radius:</span>
                  <span className="font-medium">{office.allowed_radius}m</span>
                  <span className="mx-2 text-muted-foreground">&middot;</span>
                  <span className="text-muted-foreground">Employees:</span>
                  <span className="font-medium">{getEmployeeCount(office._id)}</span>
                </div>

                <Separator />

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 gap-2" onClick={() => handleEdit(office)}>
                    <Edit2 className="h-3 w-3" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 gap-2 text-destructive border-destructive/50 hover:bg-destructive/10" onClick={() => handleDelete(office._id)}>
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        {offices.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No offices configured yet</div>
        )}
      </div>
    </div>
  );
}
