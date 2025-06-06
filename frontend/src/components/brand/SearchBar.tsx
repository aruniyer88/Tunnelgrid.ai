import { useRef, useEffect } from "react";
import { useSearch } from "@/hooks/use-search";
import { SearchInput } from "./SearchInput";
import { SearchDropdown } from "./SearchDropdown";
import { Command } from "@/components/ui/command";

interface Brand {
  id: string;
  name: string;
  domain: string;
  logo?: string;
}

interface SearchBarProps {
  selectedBrand: Brand | null;
  onSelectBrand: (brand: Brand) => void;
}

export const SearchBar = ({ selectedBrand, onSelectBrand }: SearchBarProps) => {
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const resultsListRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const {
    search,
    setSearch,
    filteredBrands,
    activeIndex,
    setActiveIndex,
    isDropdownVisible,
    setIsDropdownVisible,
    handleSelectBrand,
    handleKeyDown,
    scrollActiveItemIntoView,
    hasSearchResults,
    noResultsFound,
    loading,
    error,
  } = useSearch({
    onSelectBrand: (brand) => {
      onSelectBrand(brand);
    },
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current && 
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsDropdownVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsDropdownVisible]);

  // Auto-focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Update scroll position when active index changes
  useEffect(() => {
    scrollActiveItemIntoView(activeIndex, resultsListRef);
  }, [activeIndex, scrollActiveItemIntoView]);
  
  const handleSearchSubmit = () => {
    if (filteredBrands.length > 0) {
      handleSelectBrand(filteredBrands[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      <div 
        ref={searchContainerRef}
        className="relative"
      >
        <div 
          className="relative"
          aria-haspopup="listbox"
          aria-expanded={isDropdownVisible}
          aria-owns="search-results-list"
        >
          <Command className="rounded-lg overflow-visible border-none">
            <SearchInput 
              ref={inputRef}
              value={search}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsDropdownVisible(true)}
              onSubmit={handleSearchSubmit}
              activeDescendant={activeIndex >= 0 ? `brand-item-${filteredBrands[activeIndex].id}` : undefined}
            />
            
            <SearchDropdown 
              ref={resultsListRef}
              filteredBrands={filteredBrands}
              activeIndex={activeIndex}
              selectedBrand={selectedBrand}
              isVisible={isDropdownVisible}
              noResultsFound={noResultsFound}
              loading={loading}
              error={error}
              onSelectBrand={handleSelectBrand}
            />
          </Command>
        </div>
      </div>
    </div>
  );
};
