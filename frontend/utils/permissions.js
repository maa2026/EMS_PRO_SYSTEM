// Ye hamari rules ki kitab hai
export const ROLES = {
  SUPER_ADMIN: "L0",
  STATE_USER: "L1",
  VIP: "L2",
  ZONE: "L3",
  DISTRICT: "L4",
  PRESIDENT: "L5",
  MANAGER: "L6",
  SATHI: "L7"
};

// Kaun kisse baat kar sakta hai? (White-list)
export const CHAT_ACCESS = {
  L0: ["L1", "L2", "L3", "L4", "L5", "L6", "L7"], // Super Admin sabse
  L1: ["L0", "L3", "L4", "L5", "L6", "L7"],       // State User VIP se nahi
  L2: ["L0"],                                     // VIP sirf Super Admin se
  L7: ["L0", "L1", "L4", "L5", "L6"]              // Sathi apne booth/heads se
};