"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Search, Plus, MoreVertical, Mail, Loader2, Trash2, Edit2, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEmployees, useDeleteEmployee, useCreateEmployee, useUpdateEmployee } from "@/hooks/useEmployees";
import { useOffices } from "@/hooks/useOffices";
import { DEPARTMENTS } from "@/lib/constants";
import { toast } from "sonner";

const roleColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  manager: "bg-blue-100 text-blue-700",
  employee: "bg-emerald-100 text-emerald-700",
};

export default function EmployeesContent() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ username: "", email: "", password: "", department: "", role: "employee", assigned_office_id: "" });

  const { data, isLoading } = useEmployees();
  const { data: officesData } = useOffices();
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();

  const employees = data?.employees || [];
  const offices = officesData?.offices || [];

  const filtered = employees.filter((e: any) =>
    e.username?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase()) ||
    e.department?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setForm({ username: "", email: "", password: "", department: "", role: "employee", assigned_office_id: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.department || !form.assigned_office_id) {
      toast.error("Please fill in all required fields including office");
      return;
    }
    try {
      if (editingId) {
        const { assigned_office_id, password, ...updateData } = form;
        await updateMutation.mutateAsync({ id: editingId, data: { ...updateData, assigned_office_id, ...(password ? { password } : {}) } });
        toast.success("Employee updated");
      } else {
        if (!form.password) { toast.error("Password is required for new employees"); return; }
        await createMutation.mutateAsync(form);
        toast.success("Employee created");
      }
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Operation failed");
    }
  };

  const handleEdit = (emp: any) => {
    setForm({
      username: emp.username || "",
      email: emp.email || "",
      password: "",
      department: emp.department || "",
      role: emp.role || "employee",
      assigned_office_id: typeof emp.assigned_office_id === "object" ? emp.assigned_office_id?._id || "" : emp.assigned_office_id || "",
    });
    setEditingId(emp._id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    console.log("handleDelete called with", id);
    if (!window.confirm("Are you sure you want to delete this employee?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Employee deleted");
    } catch (err: any) {
      toast.error(err.message || "Delete failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeCount = employees.filter((e: any) => e.is_active !== false).length;
  const inactiveCount = employees.filter((e: any) => e.is_active === false).length;
  const deptCount = new Set(employees.map((e: any) => e.department)).size;

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <Users className="h-10 w-10 text-primary" />
          <div>
            <h1 className="text-3xl font-bold">Employees</h1>
            <p className="text-muted-foreground">Manage all employees in the system</p>
          </div>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gradient-primary text-white gap-2">
          <Plus className="h-4 w-4" />
          Add Employee
        </Button>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: "Total Employees", value: employees.length, desc: "Across all departments" },
          { label: "Active", value: activeCount, desc: "Currently working" },
          { label: "Inactive", value: inactiveCount, desc: "Not active" },
          { label: "Departments", value: deptCount, desc: "Unique departments" },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <Card className="shadow-premium">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.desc}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-card border border-border/40 shadow-card p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">{editingId ? "Edit Employee" : "Add New Employee"}</h3>
            <Button variant="ghost" size="icon" onClick={resetForm}><X className="h-4 w-4" /></Button>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="text-sm font-medium mb-1 block">Username *</label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="John Doe" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email *</label>
              <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@company.com" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Department *</label>
              <select
                value={form.department}
                onChange={(e) => setForm({ ...form, department: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select...</option>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Office / IP Group</label>
              <select
                value={form.assigned_office_id}
                onChange={(e) => setForm({ ...form, assigned_office_id: e.target.value })}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Select office...</option>
                {offices.map((o: any) => (
                  <option key={o._id} value={o._id}>{o.office_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{editingId ? "New Password (leave blank to keep)" : "Password *"}</label>
              <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={editingId ? "Leave empty to keep" : "Min 6 characters"} />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={resetForm}>Cancel</Button>
            <Button onClick={handleSubmit} className="gradient-primary text-white" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingId ? "Update Employee" : "Create Employee"}
            </Button>
          </div>
        </motion.div>
      )}

      <Card className="shadow-premium">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Employee Directory</CardTitle>
              <CardDescription>View and manage employee accounts</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Employee</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp: any, i: number) => (
                  <motion.tr
                    key={emp._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                  >
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold">
                          {emp.username?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "?"}
                        </div>
                        <div>
                          <p className="font-medium">{emp.username}</p>
                          <p className="text-xs text-muted-foreground">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 text-sm">{emp.department}</td>
                    <td className="py-3">
                      <Badge variant="outline" className={roleColors[emp.role] || "bg-gray-100 text-gray-700"}>
                        {emp.role}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Badge className={emp.is_active !== false ? "gradient-success text-white" : "bg-muted text-muted-foreground"}>
                        {emp.is_active !== false ? "active" : "inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button type="button" className="inline-flex shrink-0 items-center justify-center rounded-lg h-8 w-8 hover:bg-muted hover:text-foreground transition-colors" onClick={() => handleEdit(emp)}>
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button type="button" className="inline-flex shrink-0 items-center justify-center rounded-lg h-8 w-8 text-destructive hover:bg-destructive/20 transition-colors" onClick={() => handleDelete(emp._id)}>
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-muted-foreground">No employees found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
