"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Building, AlertCircle } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Company {
  ico: string
  name: string
  address: string
  city: string
  zip: string
  dic?: string
  legalForm?: string
}

interface CompanySearchProps {
  onSelect: (company: Company) => void
}

export function CompanySearch({ onSelect }: CompanySearchProps) {
  const [query, setQuery] = useState("")
  const [searchType, setSearchType] = useState<"name" | "ico">("ico")
  const [results, setResults] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [noResults, setNoResults] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return
    
    setLoading(true)
    setError(null)
    setNoResults(false)
    setResults([])
    
    try {
      const response = await fetch(`/api/company/search?query=${encodeURIComponent(query)}&type=${searchType}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch company data")
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setNoResults(false);
      } else {
        setNoResults(true);
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to search for companies. Please try again.");
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-3">
        <RadioGroup
          defaultValue={searchType}
          className="flex space-x-4"
          onValueChange={(value) => setSearchType(value as "name" | "ico")}
        >
          {/* <div className="flex items-center space-x-2">
            <RadioGroupItem value="name" id="search-name" />
            <Label htmlFor="search-name">Search by Company Name</Label>
          </div> */}
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="ico" id="search-ico" />
            <Label htmlFor="search-ico">Search by IČO</Label>
          </div>
        </RadioGroup>
        
        <div className="flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchType === "name" ? "Enter company name..." : "Enter IČO number..."}
            className="flex-1"
            onKeyPress={handleKeyPress}
          />
          <Button onClick={handleSearch} disabled={loading || !query.trim()}>
            <Search className="w-4 h-4 mr-2" />
            {loading ? "Searching..." : "Search"}
          </Button>
        </div>
      </div>
      
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
          <span className="ml-2">Searching Czech business registry...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 text-red-800 p-3 rounded-md flex items-start">
          <AlertCircle className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}
      
      {noResults && !error && (
        <div className="bg-amber-50 text-amber-800 p-3 rounded-md flex">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>No companies found matching your search criteria.</p>
        </div>
      )}
      
      {results.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Found Companies ({results.length})
            </h3>
            <div className="space-y-3">
              {results.map((company) => (
                <div
                  key={company.ico}
                  className="p-3 border rounded-md hover:bg-muted cursor-pointer transition-colors"
                  onClick={() => onSelect(company)}
                >
                  <p className="font-medium text-primary">{company.name}</p>
                  <div className="grid grid-cols-2 gap-x-4 mt-1 text-sm text-muted-foreground">
                    <p><span className="font-medium">IČO:</span> {company.ico}</p>
                    {company.dic && <p><span className="font-medium">DIČ:</span> {company.dic}</p>}
                  </div>
                  <p className="text-sm mt-1">
                    {[company.address, company.city, company.zip].filter(Boolean).join(", ")}
                  </p>
                  {company.legalForm && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {company.legalForm}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 