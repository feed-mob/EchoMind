import { db, generateId } from "./client.js";

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
  publicAccessEnabled: boolean;
  aiCollaborationEnabled: boolean;
  workspaceVisibility: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GroupSettings {
  publicAccessEnabled: boolean;
  aiCollaborationEnabled: boolean;
  workspaceVisibility: string;
}

export interface GroupMember {
  id: string;
  userId: string;
  groupId: string;
  role: string;
  joinedAt: Date;
}

export interface GroupInvitation {
  id: string;
  groupId: string;
  email: string;
  invitedByUserId?: string | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface Comment {
  id: string;
  content: string;
  ideaId: string;
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
  creatorId: string;
  selectedIdeaId?: string | null;
  selectedSettingId?: string | null;
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

// Helper function to convert mood string to numeric value
function getMoodValue(mood: string): number {
  const moodMap: Record<string, number> = {
    awesome: 5,
    good: 4,
    neutral: 3,
    low: 2,
    poor: 1,
    joyful: 5,
    calm: 4,
    anxious: 2,
    stressed: 1,
    excited: 5,
    tired: 2,
    grateful: 4,
    frustrated: 1,
  };
  return moodMap[mood.toLowerCase()] || 3;
}

// Team mood trend type
interface TeamMoodTrend {
  date: string;
  averageMood: number;
  entries: number;
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
    creatorUserId?: string;
  }) {
    return await db.$transaction(async (tx: any) => {
      const group = await tx.group.create({
        data: {
          name: data.name,
          department: data.department,
          icon: data.icon,
          logo: data.logo,
          description: data.description,
          status: "active",
        },
      });

      if (data.creatorUserId) {
        await tx.groupMember.upsert({
          where: {
            userId_groupId: {
              userId: data.creatorUserId,
              groupId: group.id,
            },
          },
          update: {
            role: "admin",
          },
          create: {
            userId: data.creatorUserId,
            groupId: group.id,
            role: "admin",
          },
        });
      }

      return group;
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

    return groups.map((group: any) => ({
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

  async getSettings(groupId: string): Promise<GroupSettings | null> {
    const group = await db.group.findUnique({
      where: { id: groupId },
      select: {
        publicAccessEnabled: true,
        aiCollaborationEnabled: true,
        workspaceVisibility: true,
      },
    });

    if (!group) return null;
    return group;
  },

  async updateSettings(groupId: string, data: GroupSettings): Promise<GroupSettings | null> {
    const updated = await db.group.update({
      where: { id: groupId },
      data: {
        publicAccessEnabled: data.publicAccessEnabled,
        aiCollaborationEnabled: data.aiCollaborationEnabled,
        workspaceVisibility: data.workspaceVisibility,
      },
      select: {
        publicAccessEnabled: true,
        aiCollaborationEnabled: true,
        workspaceVisibility: true,
      },
    });

    return updated;
  },
};

export const groupMembers = {
  async add(data: { userId: string; groupId: string; role?: string }) {
    return await db.groupMember.upsert({
      where: {
        userId_groupId: {
          userId: data.userId,
          groupId: data.groupId,
        },
      },
      update: {
        role: data.role || "member",
      },
      create: {
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

  async findFirst(options: { where: { userId: string }; with?: { group?: boolean } }) {
    const include: any = {};
    if (options.with?.group) {
      include.group = true;
    }

    return await db.groupMember.findFirst({
      where: options.where,
      include,
    });
  },
};

export const groupInvitations = {
  async createOrRefresh(data: { groupId: string; email: string; invitedByUserId?: string }) {
    const id = generateId();
    const normalizedEmail = normalizeEmail(data.email);

    await db.$executeRaw`
      INSERT INTO "GroupInvitation" ("id", "groupId", "email", "invitedByUserId", "createdAt", "updatedAt")
      VALUES (${id}, ${data.groupId}, ${normalizedEmail}, ${data.invitedByUserId || null}, NOW(), NOW())
      ON CONFLICT ("groupId", "email")
      DO UPDATE SET
        "invitedByUserId" = EXCLUDED."invitedByUserId",
        "updatedAt" = NOW()
    `;

    const rows = await db.$queryRaw<Array<GroupInvitation>>`
      SELECT "id", "groupId", "email", "invitedByUserId", "createdAt", "updatedAt"
      FROM "GroupInvitation"
      WHERE "groupId" = ${data.groupId} AND "email" = ${normalizedEmail}
      LIMIT 1
    `;

    return rows[0] || null;
  },

  async listByGroup(groupId: string) {
    return await db.$queryRaw<Array<GroupInvitation>>`
      SELECT "id", "groupId", "email", "invitedByUserId", "createdAt", "updatedAt"
      FROM "GroupInvitation"
      WHERE "groupId" = ${groupId}
      ORDER BY "updatedAt" DESC
    `;
  },

  async consumeByEmail(data: { email: string; userId: string }) {
    const normalizedEmail = normalizeEmail(data.email);
    const invitations = await db.$queryRaw<Array<{ id: string; groupId: string }>>`
      SELECT "id", "groupId"
      FROM "GroupInvitation"
      WHERE "email" = ${normalizedEmail}
    `;

    const joinedGroupIds: string[] = [];
    for (const invitation of invitations) {
      await groupMembers.add({
        userId: data.userId,
        groupId: invitation.groupId,
      });
      joinedGroupIds.push(invitation.groupId);
    }

    if (invitations.length > 0) {
      await db.$executeRaw`
        DELETE FROM "GroupInvitation"
        WHERE "email" = ${normalizedEmail}
      `;
    }

    return {
      joinedGroupIds: Array.from(new Set(joinedGroupIds)),
      consumedCount: invitations.length,
    };
  },

  async removeByGroupAndEmail(groupId: string, email: string) {
    const normalizedEmail = normalizeEmail(email);
    await db.$executeRaw`
      DELETE FROM "GroupInvitation"
      WHERE "groupId" = ${groupId} AND "email" = ${normalizedEmail}
    `;
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
    const rows = await (db.idea as any).findMany({
      where: { groupId },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return rows.map((item: any) => ({
      ...item,
      commentCount: item._count.comments,
      _count: undefined,
    }));
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

export const comments = {
  async create(data: { content: string; ideaId: string; authorId: string }) {
    return await (db as any).comment.create({
      data: {
        content: data.content,
        ideaId: data.ideaId,
        authorId: data.authorId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  },

  async listByIdea(ideaId: string) {
    return await (db as any).comment.findMany({
      where: { ideaId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  },

  async findById(id: string) {
    return await (db as any).comment.findUnique({
      where: { id },
    });
  },

  async update(id: string, data: { content: string }) {
    return await (db as any).comment.update({
      where: { id },
      data: {
        content: data.content,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  },

  async delete(id: string) {
    await (db as any).comment.delete({
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
    creatorId: string;
    selectedIdeaId?: string | null;
    selectedSettingId?: string | null;
    groupId: string;
  }) {
    return await db.goal.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status || "draft",
        successMetrics: data.successMetrics as any,
        constraints: data.constraints as any,
        creatorId: data.creatorId,
        selectedIdeaId: data.selectedIdeaId ?? null,
        selectedSettingId: data.selectedSettingId ?? null,
        groupId: data.groupId,
      },
      include: {
        creator: true,
      },
    });
  },

  async findById(id: string) {
    return await db.goal.findUnique({
      where: { id },
      include: {
        creator: true,
      },
    });
  },

  async listByGroup(groupId: string) {
    return await db.goal.findMany({
      where: { groupId },
      include: {
        creator: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async update(id: string, data: Partial<Goal>) {
    const updateData: any = { ...data };
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.updatedAt;
    delete updateData.groupId;
    delete updateData.creatorId;

    return await db.goal.update({
      where: { id },
      data: updateData,
      include: {
        creator: true,
      },
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

export interface Mood {
  id: string;
  userId: string;
  mood: string;
  sentiment: string; // positive, negative, neutral
  emotion?: string | null;
  notes?: string | null;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  // 情绪光谱系统 Emotion Spectrum System
  spectrum?: string | null;  // stress, boredom, anxiety, anger, joy, achievement, warmth, calm
  color?: string | null;     // hex color code
  icon?: string | null;      // icon name
  intensity?: number | null;   // 1-10 intensity level
  dailySummaryId?: string | null;
}

export interface MoodDailySummary {
  id: string;
  userId: string;
  date: Date;
  sentiment: string; // positive, negative, neutral
  isRedeemed: boolean;
  redeemedAt?: Date | null;
  redemptionType?: string | null; // reward, dump
  totalMoods: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface MoodRedemption {
  id: string;
  userId: string;
  type: string; // reward, dump
  sentiment: string; // positive, negative
  level: number;
  baseCount: number;
  extraCount: number;
  totalCount: number;
  reward?: string | null;
  createdAt: Date;
}

const POSITIVE_BASE = 7;
const NEGATIVE_BASE = 2;

export const moods = {
  async findById(id: string) {
    return await (db as any).mood.findUnique({
      where: { id },
    });
  },

  async listByUser(userId: string, options?: { startDate?: Date; endDate?: Date }) {
    const where: any = { userId };

    if (options?.startDate || options?.endDate) {
      where.recordedAt = {};
      if (options.startDate) {
        where.recordedAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.recordedAt.lte = options.endDate;
      }
    }

    return await (db as any).mood.findMany({
      where,
      orderBy: { recordedAt: "desc" },
    });
  },

  async listByGroup(groupId: string, options?: { startDate?: Date; endDate?: Date }) {
    const groupMembers = await (db as any).groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });

    const memberIds = groupMembers.map((m: any) => m.userId);
    if (memberIds.length === 0) {
      return [];
    }

    const where: any = {
      userId: { in: memberIds },
    };

    if (options?.startDate || options?.endDate) {
      where.recordedAt = {};
      if (options.startDate) {
        where.recordedAt.gte = options.startDate;
      }
      if (options.endDate) {
        where.recordedAt.lte = options.endDate;
      }
    }

    return await (db as any).mood.findMany({
      where,
      orderBy: { recordedAt: "desc" },
    });
  },

  // ========== 新增：sentiment 相关方法 ==========

  /**
   * 将 mood 字符串映射到 sentiment
   * 积极: joy, achievement, warmth
   * 消极: stress, boredom, anxiety, anger
   * 正常: calm
   */
  mapMoodToSentiment(mood: string): 'positive' | 'negative' | 'neutral' {
    const positiveMoods = ['joy', 'achievement', 'warmth'];
    const negativeMoods = ['stress', 'boredom', 'anxiety', 'anger'];

    const lowerMood = mood.toLowerCase();
    if (positiveMoods.includes(lowerMood)) return 'positive';
    if (negativeMoods.includes(lowerMood)) return 'negative';
    return 'neutral';
  },

  /**
   * 创建 Mood 并自动生成每日汇总
   */
  async createWithSummary(data: {
    userId: string;
    mood: string;
    emotion?: string;
    notes?: string;
    recordedAt?: Date;
    spectrum?: string;
    color?: string;
    icon?: string;
    intensity?: number;
  }) {
    const sentiment = this.mapMoodToSentiment(data.mood);
    const recordedAt = data.recordedAt || new Date();

    // 1. 创建 Mood
    const mood = await (db as any).mood.create({
      data: {
        userId: data.userId,
        mood: data.mood,
        sentiment,
        emotion: data.emotion,
        notes: data.notes,
        recordedAt,
        spectrum: data.spectrum,
        color: data.color,
        icon: data.icon,
        intensity: data.intensity,
      },
    });

    // 2. 更新或创建每日汇总
    await this.upsertDailySummary(data.userId, recordedAt);

    return mood;
  },

  /**
   * 更新或创建每日汇总
   */
  async upsertDailySummary(userId: string, date: Date) {

    // 获取日期的 UTC 时间戳，避免时区问题
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // 创建 UTC 午夜时间用于查询
    const startDate = new Date(Date.UTC(year, month, day));
    const endDate = new Date(Date.UTC(year, month, day + 1));

    const moods = await (db as any).mood.findMany({
      where: {
        userId,
        recordedAt: {
          gte: startDate,
          lt: endDate,
        },
      },
    });

    if (moods.length === 0) return null;

    // 归类当天情绪（取多数派）
    const sentiment = this.classifySentiment(moods);

    // 创建 UTC 日期用于数据库存储
    const summaryDate = new Date(Date.UTC(year, month, day));

    // 更新 Mood 的 dailySummaryId
    const summary = await (db as any).moodDailySummary.upsert({
      where: { userId_date: { userId, date: summaryDate } },
      update: {
        sentiment,
        totalMoods: moods.length,
      },
      create: {
        userId,
        date: summaryDate,
        sentiment,
        totalMoods: moods.length,
      },
    });

    // 更新所有 mood 的 dailySummaryId
    await (db as any).mood.updateMany({
      where: {
        id: { in: moods.map((m: any) => m.id) },
      },
      data: {
        dailySummaryId: summary.id,
      },
    });

    return summary;
  },

  /**
   * 归类当天情绪（取多数派）
   */
  classifySentiment(moods: any[]): 'positive' | 'negative' | 'neutral' {
    const counts = { positive: 0, negative: 0, neutral: 0 };
    moods.forEach((m) => {
      counts[m.sentiment as keyof typeof counts]++;
    });

    if (counts.positive >= counts.negative && counts.positive >= counts.neutral)
      return 'positive';
    if (counts.negative >= counts.positive && counts.negative >= counts.neutral)
      return 'negative';
    return 'neutral';
  },

  // ========== 兑换/倾倒相关方法 ==========

  /**
   * 查询兑换资格
   */
  async getRedemptionEligibility(userId: string) {
    const [positiveCount, negativeCount] = await Promise.all([
      (db as any).moodDailySummary.count({
        where: { userId, sentiment: 'positive', isRedeemed: false },
      }),
      (db as any).moodDailySummary.count({
        where: { userId, sentiment: 'negative', isRedeemed: false },
      }),
    ]);

    return {
      positive: {
        base: POSITIVE_BASE,
        count: positiveCount,
        canRedeem: positiveCount >= POSITIVE_BASE,
        level: this.calculateLevel(positiveCount, POSITIVE_BASE),
        nextLevelNeed: this.nextLevelNeed(positiveCount, POSITIVE_BASE),
      },
      negative: {
        base: NEGATIVE_BASE,
        count: negativeCount,
        canRedeem: negativeCount >= NEGATIVE_BASE,
        level: this.calculateLevel(negativeCount, NEGATIVE_BASE),
        nextLevelNeed: this.nextLevelNeed(negativeCount, NEGATIVE_BASE),
      },
    };
  },

  calculateLevel(total: number, base: number): number {
    if (total < base) return 0;
    return 1 + Math.floor((total - base) / 3);
  },

  nextLevelNeed(total: number, base: number): number {
    if (total < base) return base - total;
    const level = this.calculateLevel(total, base);
    return base + level * 3 - total;
  },

  /**
   * 执行兑换/倾倒
   */
  async redeem(userId: string, type: 'reward' | 'dump') {
    const sentiment = type === 'reward' ? 'positive' : 'negative';
    const BASE_REQUIRED = type === 'reward' ? POSITIVE_BASE : NEGATIVE_BASE;

    // 查询所有未兑换的该类型记录
    const summaries = await (db as any).moodDailySummary.findMany({
      where: { userId, sentiment, isRedeemed: false },
      orderBy: { date: 'asc' },
    });

    const totalCount = summaries.length;

    if (totalCount < BASE_REQUIRED) {
      throw new Error(
        `At least ${BASE_REQUIRED} ${sentiment === 'positive' ? 'Positive' : 'Negative'} mood, currently there are only ${totalCount} mood.`
      );
    }

    // 计算等级
    const extraCount = totalCount - BASE_REQUIRED;
    const level = 1 + Math.floor(extraCount / 3);

    // 事务：标记已兑换 + 创建记录
    const redemption = await (db as any).$transaction(async (tx: any) => {
      // 标记所有为已兑换（清零）
      await tx.moodDailySummary.updateMany({
        where: { id: { in: summaries.map((s: any) => s.id) } },
        data: {
          isRedeemed: true,
          redeemedAt: new Date(),
          redemptionType: type,
        },
      });

      // 创建兑换记录
      return tx.moodRedemption.create({
        data: {
          userId,
          type,
          sentiment,
          level,
          baseCount: BASE_REQUIRED,
          extraCount,
          totalCount,
          reward: this.generateReward(type, level),
        },
      });
    });

    return {
      redemption,
      consumed: totalCount,
      cleared: true,
    };
  },

  generateReward(type: 'reward' | 'dump', level: number): string {
    if (type === 'reward') {
      const rewards: Record<number, string> = {
        1: 'A cartoon painting',
        2: 'A technological painting',
        3: 'An artistic painting',
        4: 'A Van Gogh art painting',
      };
      return rewards[level] || `Lv.${level} Super Reward`;
    }
    return `You released ${level} level of negative emotions`;
  },

  async getRedemptionHistory(userId: string, options?: { limit?: number; offset?: number }) {
    return await (db as any).moodRedemption.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });
  },

  async getRedemptionStats(userId: string) {
    const [totalRewards, totalDumps, totalPositiveDays, totalNegativeDays] = await Promise.all([
      (db as any).moodRedemption.count({ where: { userId, type: 'reward' } }),
      (db as any).moodRedemption.count({ where: { userId, type: 'dump' } }),
      (db as any).moodDailySummary.count({ where: { userId, sentiment: 'positive', isRedeemed: true } }),
      (db as any).moodDailySummary.count({ where: { userId, sentiment: 'negative', isRedeemed: true } }),
    ]);

    return {
      totalRewards,
      totalDumps,
      totalPositiveDays,
      totalNegativeDays,
      totalRedemptions: totalRewards + totalDumps,
    };
  },

  async getStatsByUser(userId: string) {
    // 从 MoodDailySummary 获取每天的情绪倾向（仅未兑换的）
    const summaries = await (db as any).moodDailySummary.findMany({
      where: { userId, isRedeemed: false },
      orderBy: { date: "desc" },
    });

    // checkInDays 直接使用 summaries 的数量（每个summary代表一天）
    const checkInDays = summaries.length;

    const dailySentiment: Record<string, any> = {};
    if (summaries && summaries.length > 0) {
      for (const summary of summaries) {
        if (summary && summary.date && summary.sentiment) {
          const dateKey = new Date(summary.date).toISOString().split('T')[0] as string;
          dailySentiment[dateKey] = summary.sentiment;
        }
      }
    }

    // 获取 summary IDs 用于查询 entries
    const summaryIds = summaries.map((s: any) => s.id);

    // 构建查询条件：只查询属于未兑换 summary 的 entries
    const where: any = { userId };
    if (summaryIds.length > 0) {
      where.dailySummaryId = { in: summaryIds };
    }

    const entries = await (db as any).mood.findMany({
      where,
      orderBy: { recordedAt: "desc" },
    });

    const total = entries.length;
    if (total === 0) {
      return {
        total: 0,
        moodCounts: {},
        emotionCounts: {},
        checkInDays: 0,  // 本轮签到天数
        mostFrequentMood: null,
        dailySentiment: {},
      };
    }

    const moodCounts: Record<string, number> = {};
    const emotionCounts: Record<string, number> = {};

    for (const entry of entries) {
      moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
      if (entry.emotion) {
        emotionCounts[entry.emotion] = (emotionCounts[entry.emotion] || 0) + 1;
      }
    }

    const sortedMoods = Object.entries(moodCounts).sort((a, b) => b[1] - a[1]);
    const mostFrequentMood = sortedMoods.length > 0 ? sortedMoods[0]![0] : null;

    return {
      total,
      moodCounts,
      emotionCounts,
      checkInDays,  // 本轮签到天数
      mostFrequentMood, // top mood
      dailySentiment,
    };
  },


};
