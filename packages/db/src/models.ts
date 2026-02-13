import { db } from "./client";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatar?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  name: string;
  department?: string | null;
  icon?: string | null;
  logo?: string | null;
  description?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  joinedAt: Date;
}

export interface Idea {
  id: string;
  title: string;
  content?: string | null;
  status: string;
  groupId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  description?: string | null;
  status: string;
  successMetrics?: unknown;
  constraints?: unknown;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AiEvaluationSetting {
  id: string;
  groupId: string;
  goalId: string;
  model: string;
  impactWeight: number;
  feasibilityWeight: number;
  originalityWeight: number;
  selectedIdeaIds: string[];
  createdAt: Date;
}

export interface AiEvaluationResult {
  id: string;
  settingId: string;
  ideaId: string;
  review: string;
  impactScore: number;
  feasibilityScore: number;
  originalityScore: number;
  totalScore: number;
  rank: number;
  createdAt: Date;
}

export const users = {
  async create(data: { email: string; name?: string; avatar?: string }) {
    return await db.user.create({
      data: {
        email: data.email,
        name: data.name,
        avatar: data.avatar,
      },
    });
  },

  async findById(id: string) {
    return await db.user.findUnique({
      where: { id },
    });
  },

  async findByEmail(email: string) {
    return await db.user.findUnique({
      where: { email },
    });
  },

  async list() {
    return await db.user.findMany({
      orderBy: { createdAt: "desc" },
    });
  },
};

export const groups = {
  async create(data: {
    name: string;
    department?: string;
    icon?: string;
    logo?: string;
    description?: string;
  }) {
    return await db.group.create({
      data: {
        name: data.name,
        department: data.department,
        icon: data.icon,
        logo: data.logo,
        description: data.description,
        status: "active",
      },
    });
  },

  async findById(id: string) {
    return await db.group.findUnique({
      where: { id },
    });
  },

  async list() {
    return await db.group.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async listWithStats() {
    const groups = await db.group.findMany({
      include: {
        _count: {
          select: {
            members: true,
            ideas: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return groups.map((group) => ({
      ...group,
      memberCount: group._count.members,
      ideaCount: group._count.ideas,
      _count: undefined,
    }));
  },

  async update(id: string, data: Partial<Group>) {
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;

    return await db.group.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    await db.group.delete({
      where: { id },
    });
  },
};

export const groupMembers = {
  async add(data: { userId: string; groupId: string; role?: string }) {
    return await db.groupMember.create({
      data: {
        userId: data.userId,
        groupId: data.groupId,
        role: data.role || "member",
      },
    });
  },

  async remove(userId: string, groupId: string) {
    await db.groupMember.deleteMany({
      where: {
        userId,
        groupId,
      },
    });
  },

  async listByGroup(groupId: string) {
    return await db.groupMember.findMany({
      where: { groupId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { joinedAt: "asc" },
    });
  },

  async listByUser(userId: string) {
    return await db.groupMember.findMany({
      where: { userId },
      include: {
        group: {
          select: {
            id: true,
            name: true,
            department: true,
            icon: true,
            logo: true,
            status: true,
          },
        },
      },
      orderBy: { joinedAt: "desc" },
    });
  },
};

export const ideas = {
  async create(data: {
    title: string;
    content?: string;
    groupId: string;
    authorId: string;
  }) {
    return await db.idea.create({
      data: {
        title: data.title,
        content: data.content,
        groupId: data.groupId,
        authorId: data.authorId,
        status: "pending",
      },
    });
  },

  async findById(id: string) {
    return await db.idea.findUnique({
      where: { id },
    });
  },

  async listByGroup(groupId: string) {
    return await db.idea.findMany({
      where: { groupId },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, data: Partial<Idea>) {
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.groupId;
    delete updateData.authorId;

    return await db.idea.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    await db.idea.delete({
      where: { id },
    });
  },
};

export const goals = {
  async create(data: {
    title: string;
    description?: string;
    status?: string;
    successMetrics?: unknown;
    constraints?: unknown;
    groupId: string;
  }) {
    return await db.goal.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "draft",
        successMetrics: data.successMetrics as any,
        constraints: data.constraints as any,
        groupId: data.groupId,
      },
    });
  },

  async findById(id: string) {
    return await db.goal.findUnique({
      where: { id },
    });
  },

  async listByGroup(groupId: string) {
    return await db.goal.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, data: Partial<Goal>) {
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.groupId;

    return await db.goal.update({
      where: { id },
      data: updateData,
    });
  },

  async delete(id: string) {
    await db.goal.delete({
      where: { id },
    });
  },
};

export const aiEvaluationSettings = {
  async create(data: {
    groupId: string;
    goalId: string;
    model: string;
    impactWeight: number;
    feasibilityWeight: number;
    originalityWeight: number;
    selectedIdeaIds: string[];
  }) {
    return await db.aiEvaluationSetting.create({
      data: {
        groupId: data.groupId,
        goalId: data.goalId,
        model: data.model,
        impactWeight: data.impactWeight,
        feasibilityWeight: data.feasibilityWeight,
        originalityWeight: data.originalityWeight,
        selectedIdeaIds: data.selectedIdeaIds,
      },
    });
  },

  async findById(id: string) {
    return await db.aiEvaluationSetting.findUnique({
      where: { id },
    });
  },

  async listByGroup(groupId: string) {
    return await db.aiEvaluationSetting.findMany({
      where: { groupId },
      orderBy: { createdAt: "desc" },
    });
  },
};

export const aiEvaluationResults = {
  async createMany(
    data: Array<{
      settingId: string;
      ideaId: string;
      review: string;
      impactScore: number;
      feasibilityScore: number;
      originalityScore: number;
      totalScore: number;
      rank: number;
    }>,
  ) {
    if (data.length === 0) return { count: 0 };

    return await db.aiEvaluationResult.createMany({
      data: data.map((item) => ({
        settingId: item.settingId,
        ideaId: item.ideaId,
        review: item.review,
        impactScore: item.impactScore,
        feasibilityScore: item.feasibilityScore,
        originalityScore: item.originalityScore,
        totalScore: item.totalScore,
        rank: item.rank,
      })),
      skipDuplicates: true,
    });
  },

  async listBySetting(settingId: string) {
    return await db.aiEvaluationResult.findMany({
      where: { settingId },
      include: {
        idea: {
          select: {
            id: true,
            title: true,
            content: true,
            author: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: [{ rank: "asc" }, { totalScore: "desc" }],
    });
  },
};
