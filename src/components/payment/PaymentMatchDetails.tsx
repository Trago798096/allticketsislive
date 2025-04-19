
interface PaymentMatchDetailsProps {
  match: any;
}

export const PaymentMatchDetails = ({ match }: PaymentMatchDetailsProps) => {
  if (!match) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
      <div className="flex justify-between items-center mb-2">
        <div className="font-semibold">Match Details</div>
        <div className="text-xs px-2 py-1 bg-gray-100 rounded-full">
          {match.status || "Upcoming"}
        </div>
      </div>
      <div className="border-t border-gray-100 my-2" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-500">Teams</p>
          <p className="font-medium">
            {match.team1?.team_name || match.team1?.name || "Team A"} vs{" "}
            {match.team2?.team_name || match.team2?.name || "Team B"}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Venue</p>
          <p className="font-medium">{match.venue || match.stadium?.name || "TBD"}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Date</p>
          <p className="font-medium">{formatDate(match.match_date)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Time</p>
          <p className="font-medium">{formatTime(match.match_date)}</p>
        </div>
      </div>
    </div>
  );
};
