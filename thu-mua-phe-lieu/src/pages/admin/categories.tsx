import { API_BASE_URL } from "@/state";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Icon } from "zmp-ui";

interface ScrapProduct {
  id: number;
  categoryId: number;
  name: string;
  detail: string;
  image: string;
  price: number;
  unit: string;
  isAvailable: boolean;
}

interface ScrapCategory {
  id: number;
  name: string;
}

const emptyProduct: ScrapProduct = {
  id: 0,
  categoryId: 0,
  name: "",
  detail: "",
  image: "",
  price: 0,
  unit: "kg",
  isAvailable: true,
};

const productEndpoints = ["/scrap-products", "/scrap_products", "/products"];

function normalizeProduct(product: any): ScrapProduct {
  return {
    id: Number(product.id || 0),
    categoryId: Number(product.categoryId ?? product.category?.id ?? 0),
    name: product.name || "",
    detail: product.detail || product.description || "",
    image: product.image || product.imageUrl || "",
    price: Number(product.price ?? product.basePrice ?? product.pricePerKg ?? 0),
    unit: product.unit || product.category?.unit || "kg",
    isAvailable: product.isAvailable ?? product.available ?? true,
  };
}

export default function CategoryManager() {
  const [products, setProducts] = useState<ScrapProduct[]>([]);
  const [categories, setCategories] = useState<ScrapCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<ScrapProduct>({ ...emptyProduct });
  const [saving, setSaving] = useState(false);
  const [activeEndpoint, setActiveEndpoint] = useState(productEndpoints[0]);

  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`, {
        headers: { "ngrok-skip-browser-warning": "true" },
      });

      if (res.ok) {
        const data = await res.json();
        setCategories(
          Array.isArray(data)
            ? data.map((category: any) => ({
                id: Number(category.id),
                name: category.name || "",
              }))
            : []
        );
      }
    } catch {
      toast.error("Không thể tải danh mục phế liệu");
    }
  };

  const fetchProducts = async () => {
    try {
      for (const endpoint of productEndpoints) {
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          headers: { "ngrok-skip-browser-warning": "true" },
        });

        if (res.ok) {
          const data = await res.json();
          setProducts(Array.isArray(data) ? data.map(normalizeProduct) : []);
          setActiveEndpoint(endpoint);
          return;
        }
      }

      toast.error("Không thể tải sản phẩm phế liệu");
    } catch {
      toast.error("Không thể tải sản phẩm phế liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts()]);
  }, []);

  const openCreate = () => {
    setEditing({ ...emptyProduct, categoryId: categories[0]?.id ?? 0 });
    setShowForm(true);
  };

  const openEdit = (product: ScrapProduct) => {
    setEditing({ ...product });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!editing.name.trim()) {
      toast.error("Vui lòng nhập tên sản phẩm");
      return;
    }
    if (editing.price <= 0) {
      toast.error("Giá phải lớn hơn 0");
      return;
    }
    if (!editing.categoryId) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }
    setSaving(true);
    try {
      const isUpdate = editing.id > 0;
      const url = isUpdate
        ? `${API_BASE_URL}${activeEndpoint}/${editing.id}`
        : `${API_BASE_URL}${activeEndpoint}`;
      const method = isUpdate ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          category: { id: editing.categoryId },
          name: editing.name.trim(),
          detail: editing.detail.trim(),
          image: editing.image || "",
          price: editing.price,
          unit: editing.unit || "kg",
          isAvailable: editing.isAvailable,
        }),
      });

      if (res.ok) {
        toast.success(isUpdate ? "Cập nhật sản phẩm thành công!" : "Thêm sản phẩm thành công!");
        setShowForm(false);
        fetchProducts();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Lỗi khi lưu sản phẩm");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!window.confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
    try {
      const res = await fetch(`${API_BASE_URL}${activeEndpoint}/${id}`, {
        method: "DELETE",
        headers: { "ngrok-skip-browser-warning": "true" },
      });
      if (res.ok) {
        toast.success("Xóa sản phẩm thành công!");
        fetchProducts();
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err.error || "Không thể xóa sản phẩm");
      }
    } catch {
      toast.error("Không thể kết nối đến máy chủ");
    }
  };

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-primary border-t-transparent rounded-full mb-2" />
        <p>Đang tải sản phẩm phế liệu...</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-20">
      {/* Header with add button */}
      <div className="sticky top-0 bg-white z-10 p-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-bold text-gray-800">Sản phẩm phế liệu</h3>
        <button
          onClick={openCreate}
          className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1"
        >
          <Icon icon="zi-plus" size={16} />
          Thêm mới
        </button>
      </div>

      {/* Form thêm/sửa */}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center">
          <div className="bg-white w-full max-w-lg rounded-t-2xl p-5 pb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-800">
                {editing.id > 0 ? "Sửa sản phẩm" : "Thêm sản phẩm"}
              </h4>
              <button onClick={() => setShowForm(false)} className="text-gray-400">
                <Icon icon="zi-close" size={20} />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 font-medium">Danh mục</label>
                <select
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
                  value={editing.categoryId}
                  onChange={(e) => setEditing({ ...editing, categoryId: Number(e.target.value) })}
                >
                  <option value={0}>Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Tên sản phẩm</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="VD: Giấy báo, Chai PET..."
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
              </div>
              <div className="flex gap-3">
                <div className="flex-[2]">
                  <label className="text-xs text-gray-500 font-medium">Giá thu mua</label>
                  <input
                    type="number"
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
                    placeholder="0"
                    min={0}
                    value={editing.price || ""}
                    onChange={(e) => setEditing({ ...editing, price: Number(e.target.value) })}
                  />
                </div>
                <div className="flex-1">
                  <label className="text-xs text-gray-500 font-medium">Đơn vị</label>
                  <select
                    className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
                    value={editing.unit}
                    onChange={(e) => setEditing({ ...editing, unit: e.target.value })}
                  >
                    <option value="kg">kg</option>
                    <option value="tấn">tấn</option>
                    <option value="cái">cái</option>
                    <option value="chai">chai</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">URL hình ảnh (tùy chọn)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary"
                  placeholder="https://example.com/image.png"
                  value={editing.image}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 font-medium">Mô tả</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:outline-none focus:border-primary resize-none"
                  placeholder="Thông tin chi tiết về loại phế liệu"
                  rows={3}
                  value={editing.detail}
                  onChange={(e) => setEditing({ ...editing, detail: e.target.value })}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  className="accent-primary"
                  checked={editing.isAvailable}
                  onChange={(e) => setEditing({ ...editing, isAvailable: e.target.checked })}
                />
                Đang thu mua
              </label>
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {saving && <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />}
                {saving ? "Đang lưu..." : editing.id > 0 ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách */}
      <div className="p-3 space-y-2">
        {products.length === 0 ? (
          <div className="text-center text-gray-400 mt-10">
            <Icon icon="zi-file" size={40} className="mb-2 opacity-50" />
            <p>Chưa có sản phẩm phế liệu nào</p>
          </div>
        ) : (
          products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl p-3 flex items-center gap-3 shadow-sm border border-gray-100"
            >
              {/* Avatar */}
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 overflow-hidden">
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://cdn-icons-png.flaticon.com/512/2910/2910777.png";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">
                    ♻
                  </div>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-800 text-sm">{product.name}</h4>
                <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 flex-wrap">
                  <span>
                    {categories.find((category) => category.id === product.categoryId)?.name || "Chưa phân loại"}
                  </span>
                  <span>•</span>
                  <span className="text-primary font-medium">
                    {product.price.toLocaleString("vi-VN")} đ/{product.unit}
                  </span>
                  <span>•</span>
                  <span className={product.isAvailable ? "text-green-600" : "text-red-500"}>
                    {product.isAvailable ? "Đang thu mua" : "Tạm ngưng"}
                  </span>
                </div>
                {product.detail && (
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.detail}</p>
                )}
              </div>
              {/* Actions */}
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(product)}
                  className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 transition"
                  title="Sửa"
                >
                  <Icon icon="zi-edit" size={18} />
                </button>
                <button
                  onClick={() => handleDelete(product.id, product.name)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition"
                  title="Xóa"
                >
                  <Icon icon="zi-delete" size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
