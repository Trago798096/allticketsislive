
import { supabase } from "@/integrations/supabase/client";

export async function seedMatchData() {
  try {
    // Check if we already have matches in the database
    const { data: existingMatches } = await supabase
      .from("matches")
      .select("*")
      .limit(1);

    if (existingMatches && existingMatches.length > 0) {
      console.log("Match data already exists, skipping seeding");
      return;
    }

    // Sample match data
    const initialMatches = [
      {
        team1_id: "CSK",
        team2_id: "MI",
        venue: "M.A. Chidambaram Stadium, Chennai",
        match_date: new Date("2023-04-10T14:00:00Z").toISOString(),
        date: "2023-04-10T14:00:00Z" // Keep for backward compatibility
      },
      {
        team1_id: "RCB",
        team2_id: "KKR",
        venue: "M. Chinnaswamy Stadium, Bangalore",
        match_date: new Date("2023-04-11T14:00:00Z").toISOString(),
        date: "2023-04-11T14:00:00Z"
      },
      {
        team1_id: "DC",
        team2_id: "PBKS",
        venue: "Arun Jaitley Stadium, Delhi",
        match_date: new Date("2023-04-12T14:00:00Z").toISOString(),
        date: "2023-04-12T14:00:00Z"
      },
      {
        team1_id: "SRH",
        team2_id: "RR",
        venue: "Rajiv Gandhi Intl. Cricket Stadium, Hyderabad",
        match_date: new Date("2023-04-13T14:00:00Z").toISOString(),
        date: "2023-04-13T14:00:00Z"
      },
      {
        team1_id: "GT",
        team2_id: "LSG",
        venue: "Narendra Modi Stadium, Ahmedabad",
        match_date: new Date("2023-04-14T14:00:00Z").toISOString(),
        date: "2023-04-14T14:00:00Z"
      }
    ];

    // Insert matches data
    const { error: matchesError } = await supabase
      .from("matches")
      .insert(initialMatches);

    if (matchesError) {
      console.error("Error seeding matches:", matchesError);
      return;
    }

    // Sample stadium data
    const stadiumsData = [
      {
        name: "M.A. Chidambaram Stadium",
        location: "Chennai",
        city: "Chennai", // Keep for backward compatibility
        address: "Wallajah Road, Chepauk, Chennai, Tamil Nadu 600005",
        capacity: 50000,
        image_url: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?q=80&w=1024&auto=format&fit=crop",
      },
      {
        name: "M. Chinnaswamy Stadium",
        location: "Bangalore",
        city: "Bangalore",
        address: "Mahatma Gandhi Road, Bengaluru, Karnataka 560001",
        capacity: 40000,
        image_url: "https://images.unsplash.com/photo-1518019671582-55004f1bc9ad?q=80&w=1024&auto=format&fit=crop",
      },
      {
        name: "Wankhede Stadium",
        location: "Mumbai",
        city: "Mumbai",
        address: "Vinoo Mankad Road, Churchgate, Mumbai, Maharashtra 400020",
        capacity: 33000,
        image_url: "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?q=80&w=1024&auto=format&fit=crop",
      },
      {
        name: "Arun Jaitley Stadium",
        location: "Delhi",
        city: "Delhi",
        address: "Bahadur Shah Zafar Marg, Delhi 110002",
        capacity: 41000,
        image_url: "https://images.unsplash.com/photo-1615917124837-1a878798e6a9?q=80&w=1024&auto=format&fit=crop",
      },
      {
        name: "Eden Gardens",
        location: "Kolkata",
        city: "Kolkata",
        address: "Maidan, Kolkata, West Bengal 700021",
        capacity: 66000,
        image_url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?q=80&w=1024&auto=format&fit=crop",
      },
    ];

    // Insert stadiums data
    const { error: stadiumsError } = await supabase
      .from("stadiums")
      .insert(stadiumsData);

    if (stadiumsError) {
      console.error("Error seeding stadiums:", stadiumsError);
    }

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
