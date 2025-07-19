import { User, Calendar, AlertCircle, Clock } from "lucide-react";

interface PatientCardProps {
  id: string;
  name: string;
  age: number;
  gender: "M" | "F" | "Other";
  lastVisit: string;
  urgentFlags?: number;
  condition?: string;
  onClick?: () => void;
}

const PatientCard = ({
  id,
  name,
  age,
  gender,
  lastVisit,
  urgentFlags = 0,
  condition,
  onClick,
}: PatientCardProps) => {
  const formatLastVisit = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  return (
    <button
      onClick={onClick}
      className="medical-card p-4 w-full text-left hover:shadow-md transition-all duration-200 active:scale-95 relative"
    >
      {urgentFlags > 0 && (
        <div className="absolute top-3 right-3 bg-warning text-warning-foreground text-xs font-medium px-2 py-1 rounded-full">
          <AlertCircle className="w-3 h-3 inline mr-1" />
          {urgentFlags}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className="bg-muted p-2 rounded-full flex-shrink-0">
          <User className="w-5 h-5 text-muted-foreground" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground truncate">{name}</h3>
              <p className="text-sm text-muted-foreground">
                {age} years •{" "}
                {gender === "M" ? "Male" : gender === "F" ? "Female" : "Other"}
              </p>
            </div>
          </div>

          {condition && (
            <div className="mb-2">
              <span className="text-xs bg-primary-light text-primary px-2 py-1 rounded-full">
                {condition}
              </span>
            </div>
          )}

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{formatLastVisit(lastVisit)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>ID: {id.slice(-6)}</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
};

export default PatientCard;
