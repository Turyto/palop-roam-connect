
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

const AVAILABLE_TAGS = [
  "PALOP", "CPLP", "Premium", "Business", "Tourist", "Local", "Regional", "Global"
];

interface TagsSectionProps {
  selectedTags: string[];
  onTagToggle: (tag: string) => void;
}

const TagsSection = ({ selectedTags, onTagToggle }: TagsSectionProps) => {
  return (
    <div>
      <Label>Plan Tags</Label>
      <div className="flex flex-wrap gap-2 mt-2">
        {AVAILABLE_TAGS.map(tag => (
          <Badge
            key={tag}
            variant={selectedTags.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => onTagToggle(tag)}
          >
            {tag}
            {selectedTags.includes(tag) && (
              <X className="h-3 w-3 ml-1" />
            )}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default TagsSection;
