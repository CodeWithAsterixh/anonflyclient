import { useState, useRef, useCallback, useEffect } from "react";
import type { Participant } from '~/shared/types/chat';

export const useChatroomParticipants = () => {
  const [participants, setParticipants] = useState<Map<string, Participant>>(new Map());
  const participantsRef = useRef(participants);

  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  const addParticipant = useCallback((participant: Participant) => {
    setParticipants((prev) => {
      if (prev.has(participant.userAid)) return prev;
      const next = new Map(prev);
      next.set(participant.userAid, participant);
      return next;
    });
  }, []);

  const removeParticipant = useCallback((userAid: string) => {
    setParticipants((prev) => {
      if (!prev.has(userAid)) return prev;
      const next = new Map(prev);
      next.delete(userAid);
      return next;
    });
  }, []);

  const setAllParticipants = useCallback((participantsList: Participant[]) => {
    const participantMap = new Map<string, Participant>();
    participantsList.forEach((p) => {
      participantMap.set(p.userAid, p);
    });
    setParticipants(participantMap);
  }, []);

  return {
    participants,
    setParticipants,
    participantsRef,
    addParticipant,
    removeParticipant,
    setAllParticipants,
  };
};
