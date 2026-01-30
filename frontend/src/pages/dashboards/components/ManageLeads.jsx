import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  Phone,
  Mail,
  Building,
  Calendar,
  User,
  Filter,
  Search,
  RefreshCw,
  MoreVertical,
  Eye,
  Trash2,
  Download,
  UserCheck,
  Clock,
  Tag,
  ChevronDown,
} from "lucide-react";

import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import LEADS from "../../../services/leadService";

function ManageLeads({ lists = [] }) {
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [listFilter, setListFilter] = useState("");
  const [viewMode, setViewMode] = useState("all");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await LEADS.FETCH_ALL();
    if (res?.data?.success) setLeads(res.data.data || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredLeads = useMemo(() => {
    let data = [...leads];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (l) =>
          `${l.fname || ""} ${l.lname || ""}`.toLowerCase().includes(q) ||
          l.email?.toLowerCase().includes(q) ||
          l.mobile?.includes(q)
      );
    }

    if (listFilter) {
      data = data.filter((l) => String(l.list_id) === listFilter);
    }

    if (viewMode === "unattended") {
      data = data.filter((l) => !l.assigned_to);
    }

    return data;
  }, [leads, search, listFilter, viewMode]);

  const stats = {
    total: leads.length,
    unattended: leads.filter((l) => !l.assigned_to).length,
    assigned: leads.filter((l) => l.assigned_to).length,
    hot: leads.filter((l) =>
      lists.find((x) => x.id === l.list_id)?.name?.toLowerCase().includes("hot")
    ).length,
  };

  const getListName = (id) =>
    lists.find((l) => String(l.id) === String(id))?.name || "—";

  return (
    <div className="min-h-screen bg-[#0b0d10] text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Manage Leads</h1>
            <p className="text-sm text-gray-400">
              {stats.total} total leads
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchData}>
              <RefreshCw className="h-4 w-4 mr-1" /> Refresh
            </Button>
            <Button size="sm" className="gold-btn">
              <Download className="h-4 w-4 mr-1" /> Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            ["Total", stats.total],
            ["Unattended", stats.unattended],
            ["Assigned", stats.assigned],
            ["Hot", stats.hot],
          ].map(([label, value]) => (
            <div
              key={label}
              className="border border-white/10 rounded-lg px-4 py-3 bg-black/40"
            >
              <p className="text-xs text-gray-400">{label}</p>
              <p className="text-xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              className="pl-9 h-9 text-sm bg-black/50 border-white/10"
              placeholder="Search name, email or phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="h-9 bg-black/50 border border-white/10 rounded-md px-3 text-sm"
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
          >
            <option value="">All Lists</option>
            {lists.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>

          <div className="flex bg-black/40 rounded-md">
            <button
              onClick={() => setViewMode("all")}
              className={`px-3 py-1.5 text-sm ${
                viewMode === "all" ? "bg-gold text-black" : "text-gray-400"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setViewMode("unattended")}
              className={`px-3 py-1.5 text-sm ${
                viewMode === "unattended"
                  ? "bg-gold text-black"
                  : "text-gray-400"
              }`}
            >
              Unattended
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="border border-white/10 rounded-lg overflow-hidden">
          <div className="grid grid-cols-12 px-4 py-2 text-xs text-gray-400 bg-black/60">
            <div className="col-span-3">Lead</div>
            <div className="col-span-3">Contact</div>
            <div className="col-span-2">Organization</div>
            <div className="col-span-2">List</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {filteredLeads.map((lead) => (
            <div
              key={lead.id}
              className="grid grid-cols-12 px-4 py-3 text-sm border-t border-white/5 hover:bg-white/5"
            >
              <div className="col-span-3 font-medium">
                {lead.fname} {lead.lname}
                <div className="text-xs text-gray-500 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date(lead.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="col-span-3 space-y-1 text-xs">
                {lead.mobile && <div>{lead.mobile}</div>}
                {lead.email && <div className="text-gray-400">{lead.email}</div>}
              </div>

              <div className="col-span-2 text-xs">
                {lead.organization || "—"}
              </div>

              <div className="col-span-2">
                <span className="px-2 py-0.5 text-xs rounded bg-white/10">
                  {getListName(lead.list_id)}
                </span>
              </div>

              <div className="col-span-2 flex justify-end gap-2">
                <Button size="icon" variant="ghost">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" className="text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredLeads.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-10">
            No leads found
          </p>
        )}
      </div>
    </div>
  );
}

export default ManageLeads;
