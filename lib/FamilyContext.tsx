"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getFamily } from "@/lib/firestore";

interface FamilyContextValue {
  member1: string;
  member2: string;
  members: [string, string];
  notifyDaysBefore: number;
  refresh: () => Promise<void>;
}

const FamilyContext = createContext<FamilyContextValue>({
  member1: "パパ",
  member2: "ママ",
  members: ["パパ", "ママ"],
  notifyDaysBefore: 3,
  refresh: async () => {},
});

export function FamilyProvider({
  children,
  familyId,
}: {
  children: React.ReactNode;
  familyId: string;
}) {
  const [member1, setMember1] = useState("パパ");
  const [member2, setMember2] = useState("ママ");
  const [notifyDaysBefore, setNotifyDaysBefore] = useState(3);

  const load = useCallback(async () => {
    const family = await getFamily(familyId);
    if (family) {
      setMember1(family.member1 ?? "パパ");
      setMember2(family.member2 ?? "ママ");
      setNotifyDaysBefore(family.notifyDaysBefore ?? 3);
    }
  }, [familyId]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FamilyContext.Provider
      value={{
        member1,
        member2,
        members: [member1, member2],
        notifyDaysBefore,
        refresh: load,
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
}

export function useFamilyContext() {
  return useContext(FamilyContext);
}
