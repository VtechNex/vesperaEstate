import React, { useEffect, useMemo, useState, useCallback } from 'react'
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
  List,
  ChevronDown
} from 'lucide-react'

import { Input } from '../../../components/ui/input'
import { Button } from '../../../components/ui/button'
import LEADS from '../../../services/leadService'
import LISTS from '../../../services/listService'

function ManageLeads({
  lists = [],
  leads: initialLeads = [],
  onRefresh,
  onDelete,
  initialViewMode = 'all',
}) {
  const [localLists, setLocalLists] = useState([])
  const [leads, setLeads] = useState([])
  const [listFilter, setListFilter] = useState('')
  const [viewMode, setViewMode] = useState(initialViewMode || 'all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState(new Set())
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0) // Add this to trigger refreshes

  // Fetch lists and leads from API
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      console.log("🔄 [MANAGE LEADS] Fetching data...");

      const leadsResponse = await LEADS.FETCH_ALL();

      console.log("📊 [MANAGE LEADS] API response:", leadsResponse);
      console.log("📊 Response status:", leadsResponse?.status);

      if (leadsResponse?.status === 200 && leadsResponse.data?.success) {
        const leadsData = leadsResponse.data.data || [];
        console.log("✅ [MANAGE LEADS] Setting leads:", leadsData.length, "leads");
        setLeads(leadsData);
      } else {
        console.error("❌ [MANAGE LEADS] API error:", leadsResponse);
        setError(leadsResponse?.data?.message || "Failed to load leads");
      }
    } catch (err) {
      console.error("🔴 [MANAGE LEADS] Fetch error:", err);
      setError('Failed to fetch data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [])
  useEffect(() => {
    fetchData()
  }, [fetchData, refreshTrigger]) // Add refreshTrigger to dependency array

  // Refresh when new leads are passed in
  useEffect(() => {
    if (initialLeads?.length) {
      console.log("🔄 [MANAGE LEADS] Received initial leads:", initialLeads.length);
      setLeads(initialLeads)
    }
  }, [initialLeads])

  useEffect(() => {
    if (lists?.length) setLocalLists(lists)
  }, [lists])

  // Manual refresh function
  const handleRefresh = useCallback(() => {
    console.log("🔄 [MANAGE LEADS] Manual refresh triggered");
    setRefreshTrigger(prev => prev + 1)
    if (onRefresh) onRefresh()
  }, [onRefresh])

  // Utility functions
  const getListName = (listId) => {
    if (!listId) return '—'
    const found = localLists.find(
      (list) => String(list.id) === String(listId) || String(list._id) === String(listId)
    )
    return found ? found.name : '—'
  }

  const formatDate = (dateString) => {
    if (!dateString) return '—'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    } catch (err) {
      return '—'
    }
  }

  // Filter logic
  const filteredLeads = useMemo(() => {
    let filtered = [...leads]

    // Basic search
    if (search.trim()) {
      const query = search.toLowerCase()
      filtered = filtered.filter(lead => {
        const fullName = `${lead.fname || ''} ${lead.lname || ''}`.toLowerCase().trim()
        return (
          fullName.includes(query) ||
          (lead.email && lead.email.toLowerCase().includes(query)) ||
          (lead.mobile && lead.mobile.includes(query)) ||
          (lead.organization && lead.organization.toLowerCase().includes(query))
        )
      })
    }

    // List filter
    if (listFilter) {
      filtered = filtered.filter(lead =>
        String(lead.list_id || lead.listId || lead.list) === String(listFilter)
      )
    }

    // View mode specific filters
    if (viewMode === 'unattended') {
      filtered = filtered.filter(lead =>
        !lead.assigned_to || lead.assigned_to === 'Unassigned' || lead.assigned_to === ''
      )
    }

    return filtered
  }, [leads, search, listFilter, viewMode])

  // Stats
  const stats = useMemo(() => ({
    total: leads.length,
    unattended: leads.filter(lead => !lead.assigned_to || lead.assigned_to === 'Unassigned' || lead.assigned_to === '').length,
    assigned: leads.filter(lead => lead.assigned_to && lead.assigned_to !== 'Unassigned' && lead.assigned_to !== '').length,
    qualified: leads.filter(lead => (lead.stage || '').toLowerCase().includes('qualified')).length,
    hot: leads.filter(lead => {
      const listName = getListName(lead.list_id)
      return listName.toLowerCase().includes('hot')
    }).length,
  }), [leads, getListName])

  // Bulk actions
  const handleBulkSelect = (leadId) => {
    const newSelected = new Set(selectedLeads)
    if (newSelected.has(leadId)) {
      newSelected.delete(leadId)
    } else {
      newSelected.add(leadId)
    }
    setSelectedLeads(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedLeads.size === filteredLeads.length && filteredLeads.length > 0) {
      setSelectedLeads(new Set())
    } else {
      setSelectedLeads(new Set(filteredLeads.map(lead => lead.id)))
    }
  }

  const handleDeleteLead = async (leadId) => {
    if (!window.confirm('Are you sure you want to delete this lead?')) return

    try {
      console.log("🗑️ [MANAGE LEADS] Deleting lead ID:", leadId);
      const response = await LEADS.DELETE(leadId)

      if (response?.status === 200) {
        // Remove from local state
        setLeads(prev => prev.filter(lead => lead.id !== leadId))

        // Call parent callback if provided
        if (onDelete) await onDelete(leadId)

        // Refresh data to ensure consistency
        handleRefresh()
      } else {
        throw new Error(response?.data?.message || "Failed to delete lead")
      }
    } catch (err) {
      console.error("🔴 [MANAGE LEADS] Delete error:", err);
      setError(err.message || 'Failed to delete lead')
    }
  }

  const resetFilters = () => {
    setListFilter('')
    setSearch('')
    setSelectedLeads(new Set())
  }

  // Get lead name
  const getLeadName = (lead) => {
    if (lead.fname && lead.lname) {
      return `${lead.fname} ${lead.lname}`
    } else if (lead.fname) {
      return lead.fname
    } else if (lead.name) {
      return lead.name
    }
    return 'Unnamed Lead'
  }

  // Clear error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 md:p-6">
      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">MANAGE LEADS</h1>
              <p className="text-gray-400 text-lg">
                Browse and manage all leads captured in your lists. Total: <span className="text-gold font-semibold">{stats.total}</span> leads
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="lg"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="border-white/20 hover:bg-white/10 text-white"
              >
                <Filter className="h-5 w-5 mr-2" />
                {showAdvancedFilters ? 'Hide Filters' : 'Advanced Filters'}
                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={handleRefresh}
                className="border-white/20 hover:bg-white/10 text-white"
                disabled={loading}
              >
                <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? 'Refreshing...' : 'Refresh'}
              </Button>

              <Button className="gold-btn gold-shine text-lg px-6 py-3">
                <Download className="h-5 w-5 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Leads Card */}
            <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border border-blue-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-300 mb-1">Total Leads</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <List className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </div>

            {/* Unattended Leads Card */}
            <div className="bg-gradient-to-br from-amber-900/30 to-amber-800/10 border border-amber-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-amber-300 mb-1">Unattended Leads</p>
                  <p className="text-3xl font-bold text-amber-400">{stats.unattended}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Assigned Card */}
            <div className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border border-emerald-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-300 mb-1">Assigned</p>
                  <p className="text-3xl font-bold text-emerald-400">{stats.assigned}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-emerald-400" />
                </div>
              </div>
            </div>

            {/* Hot Leads Card */}
            <div className="bg-gradient-to-br from-red-900/30 to-red-800/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-300 mb-1">Hot Leads</p>
                  <p className="text-3xl font-bold text-red-400">{stats.hot}</p>
                </div>
                <div className="h-12 w-12 rounded-full bg-red-500/20 flex items-center justify-center">
                  <Tag className="h-6 w-6 text-red-400" />
                </div>
              </div>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex bg-black/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('all')}
                className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'all' ? 'bg-gold text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                View All Leads
              </button>
              <button
                onClick={() => setViewMode('unattended')}
                className={`px-4 py-2 rounded-md transition-colors ${viewMode === 'unattended' ? 'bg-gold text-black font-semibold' : 'text-gray-400 hover:text-white'}`}
              >
                Unattended Leads
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-black/40 border border-white/10 rounded-xl p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              {/* List Filter */}
              <div className="flex-1">
                <label htmlFor="listFilterSelect" className="block text-sm text-gray-400 mb-2">
                  Select List
                </label>
                <div className="relative">
                  <select
                    id="listFilterSelect"
                    value={listFilter}
                    onChange={(e) => setListFilter(e.target.value)}
                    className="w-full bg-black/60 border border-white/20 text-white rounded-lg px-4 py-3 text-base focus:outline-none focus:border-gold appearance-none"
                  >
                    <option value="">All Lists</option>
                    {localLists.map(list => (
                      <option key={list.id} value={list.id}>{list.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Search */}
              <div className="flex-1">
                <label htmlFor="leadSearchInput" className="block text-sm text-gray-400 mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="leadSearchInput"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, email or phone..."
                    className="pl-10 bg-black/60 border-white/20 text-white text-base py-3"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="border-white/20 hover:bg-white/10 text-white py-3"
                >
                  Reset Filters
                </Button>
              </div>
            </div>

            {/* Advanced Filters Dropdown */}
            {showAdvancedFilters && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="dateRangeFilter" className="block text-sm text-gray-400 mb-2">
                      Date Range
                    </label>
                    <select
                      id="dateRangeFilter"
                      className="w-full bg-black/60 border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                    >
                      <option>All Time</option>
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 90 Days</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="stageFilter" className="block text-sm text-gray-400 mb-2">
                      Lead Stage
                    </label>
                    <select
                      id="stageFilter"
                      className="w-full bg-black/60 border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                    >
                      <option>All Stages</option>
                      <option>Open</option>
                      <option>Contacted</option>
                      <option>Qualified</option>
                      <option>Proposal</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="assignedFilter" className="block text-sm text-gray-400 mb-2">
                      Assigned To
                    </label>
                    <select
                      id="assignedFilter"
                      className="w-full bg-black/60 border border-white/20 text-white rounded-lg px-3 py-2 text-sm"
                    >
                      <option>All</option>
                      <option>Assigned</option>
                      <option>Unassigned</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Results Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <p className="text-gray-400 text-lg">
                Showing <span className="text-white font-semibold">{filteredLeads.length}</span> leads
                {search && ` for "${search}"`}
              </p>
            </div>

            {selectedLeads.size > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-blue-300">
                  {selectedLeads.size} leads selected
                </span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="border-blue-500/40 text-blue-300">
                    Assign
                  </Button>
                  <Button variant="outline" size="sm" className="border-green-500/40 text-green-300">
                    Change Status
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/40 text-red-300"
                    onClick={() => {
                      if (window.confirm(`Delete ${selectedLeads.size} selected leads?`)) {
                        // Bulk delete implementation
                        console.log("Bulk delete:", Array.from(selectedLeads))
                        setSelectedLeads(new Set())
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gold mx-auto"></div>
              <p className="mt-6 text-gray-400 text-lg">Loading leads...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-red-500/20 flex items-center justify-center">
                    <span className="text-red-400 text-xl">!</span>
                  </div>
                  <div>
                    <p className="text-red-200">{error}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setError('')}>
                  Dismiss
                </Button>
              </div>
            </div>
          )}

          {/* Leads Display */}
          {!loading && (
            <>
              {filteredLeads.length > 0 ? (
                <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-4 p-4 border-b border-white/10 bg-black/60">
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        id="selectAllLeads"
                        checked={selectedLeads.size === filteredLeads.length && filteredLeads.length > 0}
                        onChange={handleSelectAll}
                        className="h-5 w-5 rounded border-white/40 bg-black/40"
                      />
                    </div>
                    <div className="col-span-3 font-medium text-gray-400">Lead Name</div>
                    <div className="col-span-2 font-medium text-gray-400">Contact</div>
                    <div className="col-span-2 font-medium text-gray-400">Organization</div>
                    <div className="col-span-2 font-medium text-gray-400">List</div>
                    <div className="col-span-2 font-medium text-gray-400 text-right">Actions</div>
                  </div>

                  {/* Table Rows */}
                  <div className="divide-y divide-white/10">
                    {filteredLeads.map((lead, index) => (
                      <div key={lead.id || index} className="grid grid-cols-12 gap-4 p-4 hover:bg-white/5 transition-colors">
                        {/* Checkbox */}
                        <div className="col-span-1 flex items-center">
                          <input
                            type="checkbox"
                            id={`selectLead-${lead.id}`}
                            checked={selectedLeads.has(lead.id)}
                            onChange={() => handleBulkSelect(lead.id)}
                            className="h-5 w-5 rounded border-white/40 bg-black/40"
                          />
                        </div>

                        {/* Lead Name */}
                        <div className="col-span-3">
                          <div className="font-medium text-white text-lg">{getLeadName(lead)}</div>
                          <div className="text-sm text-gray-400 mt-1 flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                            {formatDate(lead.created_at)}
                          </div>
                        </div>

                        {/* Contact Info */}
                        <div className="col-span-2">
                          <div className="space-y-2">
                            {lead.mobile && (
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Phone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span>{lead.mobile}</span>
                              </div>
                            )}
                            {lead.email && (
                              <div className="flex items-center gap-2 text-sm text-gray-300">
                                <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="truncate">{lead.email}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Organization */}
                        <div className="col-span-2">
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <span className="text-sm">{lead.organization || '—'}</span>
                          </div>
                          {lead.designation && (
                            <div className="text-xs text-gray-500 mt-1">{lead.designation}</div>
                          )}
                        </div>

                        {/* List */}
                        <div className="col-span-2">
                          <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-white text-sm">
                            {getListName(lead.list_id)}
                          </div>
                          <div className="mt-2 text-xs text-gray-400 flex items-center">
                            <User className="h-3 w-3 mr-1 flex-shrink-0" />
                            {lead.assigned_to && lead.assigned_to !== 'Unassigned' && lead.assigned_to !== '' ? (
                              <span>{lead.assigned_to}</span>
                            ) : (
                              <span className="text-amber-400">Unassigned</span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="col-span-2 flex justify-end items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 hover:bg-white/10"
                            title="View Details"
                            onClick={() => console.log("View details:", lead.id)}
                          >
                            <Eye className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            title="Delete Lead"
                            onClick={() => handleDeleteLead(lead.id)}
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-10 w-10 p-0 hover:bg-white/10"
                            title="More Options"
                            onClick={() => console.log("More options:", lead.id)}
                          >
                            <MoreVertical className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                // Empty State
                <div className="bg-black/40 border border-white/10 rounded-xl p-12 text-center">
                  <div className="mx-auto max-w-md">
                    <div className="h-20 w-20 mx-auto rounded-full bg-white/10 flex items-center justify-center mb-6">
                      <Search className="h-10 w-10 text-gray-400" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white mb-3">NO LEADS FOUND</h3>
                    <p className="text-gray-400 text-lg mb-8">
                      {search
                        ? `No leads match your search "${search}". Try different keywords.`
                        : 'No leads available. Add some leads to get started.'}
                    </p>
                    <Button
                      className="gold-btn gold-shine text-lg px-8 py-4"
                      onClick={resetFilters}
                    >
                      {search ? 'Clear Search' : 'Add New Lead'}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Pagination */}
          {filteredLeads.length > 0 && (
            <div className="flex items-center justify-between mt-8">
              <div className="text-gray-400">
                Page 1 of 1 • Showing {filteredLeads.length} of {leads.length} leads
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="lg" disabled className="border-white/20">
                  Previous
                </Button>
                <Button variant="outline" size="lg" className="gold-btn">
                  1
                </Button>
                <Button variant="outline" size="lg" disabled className="border-white/20">
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManageLeads