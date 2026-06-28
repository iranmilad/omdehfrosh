import HomePageSection from "../models/HomePageSection.js";
import Category from "../models/Category.js";
import UserAccount from "../models/User.js";
import PriceList from "../models/PriceList.js";
import WideSlider from "../models/WideSlider.js";
import FP from "../models/FP.js";
import Banner from "../models/Banner.js";
import ProductGrid from "../models/ProductGrid.js";
import TrendProductGroup from "../models/TrendProduct.js";
import ProductLoopGroup from "../models/ProductLoop.js";
import Brand from "../models/Brand.js";

const toPlainObject = (obj) => {
  if (obj && typeof obj.toObject === "function") return obj.toObject();
  if (obj && typeof obj.toJSON === "function") return obj.toJSON();
  return obj;
};

const removeUnwantedFields = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => removeUnwantedFields(item));
  }
  if (obj !== null && typeof obj === "object") {
    const newObj = {};
    for (const key in obj) {
      if (key !== "_id" && key !== "__v") {
        newObj[key] = removeUnwantedFields(obj[key]);
      }
    }
    return newObj;
  }
  return obj;
};

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const generateMockInventory = () => {
  const stockOptions = [1000, 5000, 1000, 1005, 2000, 2005, 3000, 5000, 7005, 10000];
  const minOrderOptions = [1, 2, 5, 10];
  const stock = stockOptions[Math.floor(Math.random() * stockOptions.length)];
  const minOrder = minOrderOptions[Math.floor(Math.random() * minOrderOptions.length)];
  let maxOrder;
  if (stock === 0) maxOrder = 0;
  else if (stock <= minOrder) maxOrder = stock;
  else {
    const possibleMaxOrders = [minOrder * 2, minOrder * 5, minOrder * 10, stock];
    maxOrder = Math.min(
      possibleMaxOrders[Math.floor(Math.random() * possibleMaxOrders.length)],
      stock
    );
  }
  return { stock, minOrder, maxOrder };
};

const enrichProductsWithInventory = (products) =>
  (products || []).map((product) => ({
    ...toPlainObject(product),
    ...generateMockInventory(),
  }));

const getUserSubscriptions = (user) => {
  if (!user?.subscriptions) return [];
  if (typeof user.subscriptions === "object" && !Array.isArray(user.subscriptions)) {
    return Object.keys(user.subscriptions);
  }
  if (Array.isArray(user.subscriptions)) return user.subscriptions;
  return [];
};

const applyCategoryDisplayRules = (categories, userData, userSubscriptions) => {
  return categories.map((cat, index) => {
    const plain = toPlainObject(cat);
    const modelId = plain.subscriptionModel?.modelId;

    if (!userData || !userData.user_id) {
      return {
        ...plain,
        display: index < 3 || !modelId || modelId === "basic",
      };
    }

    if (index < 3 || !modelId) {
      return { ...plain, display: true };
    }

    const isSubscribed = userSubscriptions.some(
      (sub) => sub.toLowerCase() === modelId.toLowerCase()
    );
    return { ...plain, display: isSubscribed };
  });
};

const resolveCategoriesData = async (section, userData) => {
  const allCategories = await Category.find({}).lean();
  let userSubscriptions = [];

  if (userData?.user_id) {
    const user = await UserAccount.findOne({ userId: userData.user_id });
    if (!user) return [];
    userSubscriptions = getUserSubscriptions(user);
  }

  const categoryUrls = section.data?.categoryUrls;
  const embeddedItems = section.data?.items;

  let sourceCategories = allCategories;
  if (Array.isArray(categoryUrls) && categoryUrls.length > 0) {
    sourceCategories = allCategories.filter((cat) => categoryUrls.includes(cat.url));
  } else if (Array.isArray(embeddedItems) && embeddedItems.length > 0) {
    sourceCategories = embeddedItems;
  }

  return applyCategoryDisplayRules(sourceCategories, userData, userSubscriptions);
};

const mapHomePageSection = async (section, userData) => {
  const checkalllink =
    section.checkalllink || process.env.HOMEPAGE_CHECKALL_LINK || "/shop/samsung";
  const featuredPromoBg =
    section.backgroundColor ||
    process.env.FEATURED_PROMO_BG ||
    "linear-gradient(to bottom left, #1e3a5f, #0a1628)";

  const base = {
    order: section.order ?? 0,
    title: section.title || "",
  };

  switch (section.type) {
    case "wideslider":
      return {
        ...base,
        type: "wideslider",
        data: section.data?.slides || section.data?.items || [],
      };

    case "categories":
      return {
        ...base,
        type: "categories",
        data: await resolveCategoriesData(section, userData),
      };

    case "featured_promo":
      return {
        ...base,
        type: "featured_promo",
        checkalllink,
        backgroundColor: featuredPromoBg,
        data: enrichProductsWithInventory(section.data?.products || []),
      };

    case "banners":
      return {
        ...base,
        type: "banners",
        data: section.data?.items || section.data?.banners || [],
      };

    case "prices":
      return {
        ...base,
        type: "prices",
        data: section.data?.items || section.data?.tables || [],
      };

    case "trendProducts":
      return {
        ...base,
        type: "trendProducts",
        data: section.data?.products || [],
      };

    case "brands":
      return {
        ...base,
        type: "brands",
        data: {
          title: section.title || section.data?.title || "برندها",
          children: section.data?.children || [],
        },
      };

    case "productloop":
      return {
        ...base,
        type: "productloop",
        data: enrichProductsWithInventory(section.data?.products || []),
      };

    default:
      return null;
  }
};

export const buildHomePageFromSections = async (userData) => {
  const sections = await HomePageSection.find({ enabled: true })
    .sort({ order: 1, createdAt: 1 })
    .lean();

  if (sections.length === 0) return null;

  const mapped = [];
  for (const section of sections) {
    const built = await mapHomePageSection(section, userData);
    if (!built) continue;

    const hasContent = Array.isArray(built.data)
      ? built.data.length > 0
      : (built.data?.children?.length ?? 0) > 0;

    if (hasContent) {
      mapped.push(built);
    }
  }

  return removeUnwantedFields(mapped);
};

export const buildLegacyHomePage = async (userData) => {
  const [
    allCategories,
    priceLists,
    sliders,
    fps,
    banners,
    pg,
    tp,
    pl,
    brandDocs,
  ] = await Promise.all([
    Category.find({}),
    PriceList.find(),
    WideSlider.find(),
    FP.find(),
    Banner.find(),
    ProductGrid.find(),
    TrendProductGroup.find(),
    ProductLoopGroup.find().sort({ createdAt: 1 }),
    Brand.find().lean(),
  ]);

  let userSubscriptions = [];
  if (userData?.user_id) {
    const user = await UserAccount.findOne({ userId: userData.user_id });
    if (!user) throw new Error("USER_NOT_FOUND");
    userSubscriptions = getUserSubscriptions(user);
  }

  const filteredCategories = applyCategoryDisplayRules(
    allCategories,
    userData,
    userSubscriptions
  );

  const allTrendingProducts = tp.reduce((acc, item) => {
    if (Array.isArray(item.products)) {
      const rows = item.products
        .filter((row) => Array.isArray(row))
        .map((row) => row.map((p) => toPlainObject(p)));
      acc.push({ title: item.title, products: rows });
    }
    return acc;
  }, []);

  const enrichedFps = enrichProductsWithInventory(fps);
  const shuffledFeaturedPromo = shuffleArray(enrichedFps);

  const plainSliders = sliders.map((s) => toPlainObject(s));
  const plainBanners = banners.map((b) => toPlainObject(b));
  const plainPriceLists = priceLists.map((p) => toPlainObject(p));
  const plainPg = pg.map((p) => toPlainObject(p));

  const checkalllink = process.env.HOMEPAGE_CHECKALL_LINK || "/shop/samsung";
  const featuredPromoBg =
    process.env.FEATURED_PROMO_BG || "linear-gradient(to bottom left, #1e3a5f, #0a1628)";

  const data = [];

  if (plainSliders.length > 0) {
    data.push({ type: "wideslider", title: "اسلایدر اصلی", data: plainSliders });
  }
  if (filteredCategories.length > 0) {
    data.push({ type: "categories", title: "دسته‌بندی‌ها", data: filteredCategories });
  }
  if (shuffledFeaturedPromo.length > 0) {
    data.push({
      type: "featured_promo",
      title: "پیشنهاد ویژه",
      checkalllink,
      backgroundColor: featuredPromoBg,
      data: shuffledFeaturedPromo,
    });
  }
  if (plainBanners.length > 0) {
    data.push({ type: "banners", title: "بنرها", data: plainBanners });
  }
  if (plainPriceLists.length > 0) {
    data.push({ type: "prices", title: "لیست قیمت", data: plainPriceLists });
  }
  if (plainPg.length > 0) {
    data.push({ type: "productGrid", title: "شبکه محصول", data: plainPg });
  }

  allTrendingProducts.forEach((group, index) => {
    if (group.products?.length > 0) {
      data.push({
        type: "trendProducts",
        title: group.title || `محصولات پرفروش ${index + 1}`,
        data: group.products,
      });
    }
  });

  brandDocs.forEach((brandDoc, index) => {
    const { _id, __v, children, ...rest } = brandDoc;
    const cleanedChildren = children ? children.map(({ _id: childId, ...child }) => child) : [];
    if (cleanedChildren.length > 0) {
      data.push({
        type: "brands",
        title: rest.title || brandDoc.title || `برندها ${index + 1}`,
        data: { ...rest, title: rest.title || brandDoc.title, children: cleanedChildren },
      });
    }
  });

  pl.forEach((loop) => {
    const products = (loop.products || []).flat();
    if (products.length > 0) {
      data.push({
        type: "productloop",
        title: loop.title || "محصولات منتخب",
        data: enrichProductsWithInventory(products),
      });
    }
  });

  return removeUnwantedFields(data);
};
