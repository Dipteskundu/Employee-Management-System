"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, Mail, Trash2, ArrowRightLeft, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useOfficeMembers, useAddToOffice, useRemoveFromOffice, useTransferEmployee, useOffices } from "@/hooks/useOffices";
import { toast } from "sonner";

interface OfficeMembersProps {
  officeId: string;
  officeName: string;
  onClose: () => void;
}

export default function OfficeMembers({ officeId, officeName, onClose }: OfficeMembersProps) {
  const { data: membersData, isLoading } = useOfficeMembers(officeId);
  const { data: officesData } = useOffices();
  const addToOfficeMutation = useAddToOffice();
  const removeFromOfficeMutation = useRemoveFromOffice();
  const transferMutation = useTransferEmployee();

  const [email, setEmail] = useState("");
  const [transferringId, setTransferringId] = useState<string | null>(null);
  const [transferTo, setTransferTo] = useState("");

  const members = membersData?.members || [];
  const offices = (officesData?.offices || []).filter((o: any) => o._id !== officeId);

  const handleAddByEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }
    try {
      await addToOfficeMutation.mutateAsync({ office_id: officeId, email: email.trim() });
      toast.success("Employee added to office");
      setEmail("");
    } catch (err: any) {
      toast.error(err.message || "Failed to add employee");
    }
  };

  const handleRemove = async (employeeId: string, name: string) => {
    if (!window.confirm(`Remove "${name}" from this office? They will be transferred to another office.`)) return;
    try {
      const result = await removeFromOfficeMutation.mutateAsync({ office_id: officeId, employee_id: employeeId });
      toast.success(`Employee transferred to ${result.transferred_to}`);
    } catch (err: any) {
      toast.error(err.message || "Failed to remove employee");
    }
  };

  const handleTransfer = async (employeeId: string) => {
    if (!transferTo) {
      toast.error("Please select a target office");
      return;
    }
    try {
      await transferMutation.mutateAsync({
        employee_id: employeeId,
        from_office_id: officeId,
        to_office_id: transferTo,
      });
      toast.success("Employee transferred successfully");
      setTransferringId(null);
      setTransferTo("");
    } catch (err: any) {
      toast.error(err.message || "Transfer failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl bg-card border border-border/40 shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">{officeName} - Members</h3>
          <Badge variant="outline">{members.length}</Badge>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Add by email */}
      <div className="flex gap-2 mb-4">
        <div className="flex-1 relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Add employee by email..."
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleAddByEmail(); }}
            className="pl-10"
          />
        </div>
        <Button onClick={handleAddByEmail} disabled={addToOfficeMutation.isPending} className="gradient-primary text-white">
          {addToOfficeMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
        </Button>
      </div>

      {/* Members list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : members.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No members in this office</p>
      ) : (
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {members.map((member: any) => (
            <div key={member._id} className="flex items-center justify-between p-3 rounded-lg bg-background hover:bg-muted/30 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {member.username?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{member.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {transferringId === member._id ? (
                  <div className="flex items-center gap-1">
                    <select
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="h-7 rounded border border-input bg-background px-2 text-xs"
                    >
                      <option value="">Select...</option>
                      {offices.map((o: any) => (
                        <option key={o._id} value={o._id}>{o.office_name}</option>
                      ))}
                    </select>
                    <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => handleTransfer(member._id)} disabled={transferMutation.isPending}>
                      Move
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7" onClick={() => { setTransferringId(null); setTransferTo(""); }}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setTransferringId(member._id)}
                      title="Transfer"
                    >
                      <ArrowRightLeft className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      onClick={() => handleRemove(member._id, member.username)}
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
