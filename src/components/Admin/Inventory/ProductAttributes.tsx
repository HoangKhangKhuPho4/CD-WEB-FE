"use client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { adminAttributeApi } from "@/utils/adminApi";

interface AttributeValue {
  id: number;
  name: string;
  color?: string;
}

interface Attribute {
  id: number;
  name: string;
  values: AttributeValue[];
}

export default function ProductAttributes() {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [selectedAttr, setSelectedAttr] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"attribute" | "value">("value");
  const [showAddValue, setShowAddValue] = useState(false);
  const [newValueName, setNewValueName] = useState("");
  const [newValueColor, setNewValueColor] = useState("#3C50E0");
  const [showAddAttr, setShowAddAttr] = useState(false);
  const [newAttrName, setNewAttrName] = useState("");

  const selectedAttribute = attributes[selectedAttr];
  const isColorAttribute = selectedAttribute?.name.toLowerCase().includes("màu");

  const previewAttr = attributes.find((_, i) => i !== selectedAttr);

  const loadAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminAttributeApi.list();
      if (res.data.success) {
        const base = res.data.data.map((a) => ({ id: a.id, name: a.name, values: [] as AttributeValue[] }));
        setAttributes(base);
        if (base.length) {
          const valsRes = await adminAttributeApi.listValues(base[0].id);
          if (valsRes.data.success) {
            base[0].values = valsRes.data.data.map((v) => ({ id: v.id, name: v.value }));
            setAttributes([...base]);
          }
        }
      }
    } catch {
      toast.error("Không tải thuộc tính");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAttributes();
  }, [loadAttributes]);

  const loadValuesFor = async (index: number) => {
    const attr = attributes[index];
    if (!attr) return;
    try {
      const res = await adminAttributeApi.listValues(attr.id);
      if (res.data.success) {
        setAttributes((prev) => {
          const next = [...prev];
          next[index] = {
            ...next[index],
            values: res.data.data.map((v) => ({ id: v.id, name: v.value })),
          };
          return next;
        });
      }
    } catch {
      toast.error("Không tải giá trị thuộc tính");
    }
  };

  const handleAddValue = async () => {
    if (!newValueName.trim() || !selectedAttribute) return;
    try {
      await adminAttributeApi.createValue({
        attributeId: selectedAttribute.id,
        value: newValueName.trim(),
      });
      setNewValueName("");
      setShowAddValue(false);
      await loadValuesFor(selectedAttr);
    } catch {
      toast.error("Thêm giá trị thất bại");
    }
  };

  const handleAddAttribute = async () => {
    if (!newAttrName.trim()) return;
    try {
      await adminAttributeApi.create({ name: newAttrName.trim() });
      setNewAttrName("");
      setShowAddAttr(false);
      await loadAttributes();
    } catch {
      toast.error("Thêm thuộc tính thất bại");
    }
  };

  const removeValue = async (valueId: number) => {
    try {
      await adminAttributeApi.removeValue(valueId);
      await loadValuesFor(selectedAttr);
    } catch {
      toast.error("Xóa giá trị thất bại");
    }
  };

  if (loading) {
    return <p className="px-6 py-8 text-sm text-[#8D93A5]">Đang tải thuộc tính...</p>;
  }

  return (
    <div className="bg-white rounded-xl border border-gray-3/50 hover:shadow-2 transition-shadow duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-6 py-5 border-b border-gray-3/50 gap-3">
        <div>
          <h2 className="text-xl font-bold text-dark">Thuộc tính sản phẩm</h2>
          <p className="text-sm text-[#6C6F93] mt-0.5">
            Cấu hình Màu sắc, Kích thước, RAM và các thông số kỹ thuật khác.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab("attribute");
              setShowAddAttr(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-dark border border-gray-3 rounded-lg text-sm font-medium hover:border-[#3C50E0] hover:text-[#3C50E0] transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Thuộc tính
          </button>
          <button
            onClick={() => setActiveTab("value")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "value"
                ? "bg-[#3C50E0] text-white shadow-lg shadow-[#3C50E0]/25"
                : "bg-white text-dark border border-gray-3 hover:border-[#3C50E0]"
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4.66667 2.33334H2.33333V4.66667H4.66667V2.33334Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.66667 5.83334H2.33333V8.16667H4.66667V5.83334Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4.66667 9.33334H2.33333V11.6667H4.66667V9.33334Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.41667 3.5H11.6667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.41667 7H11.6667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M6.41667 10.5H11.6667" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Giá trị
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Attribute List */}
          <div className="lg:w-[280px] flex-shrink-0">
            <div className="bg-[#F7F9FC] rounded-xl p-4">
              <h4 className="text-sm font-bold text-dark mb-3 px-1">
                Danh sách thuộc tính
              </h4>
              <div className="space-y-1">
                {attributes.map((attr, index) => (
                  <button
                    key={attr.id}
                    onClick={() => {
                      setSelectedAttr(index);
                      void loadValuesFor(index);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      selectedAttr === index
                        ? "bg-white text-[#3C50E0] shadow-1 border-l-[3px] border-l-[#3C50E0]"
                        : "text-[#6C6F93] hover:bg-white/70 hover:text-dark"
                    }`}
                  >
                    <span>{attr.name}</span>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
              </div>

              {/* Add Attribute Inline */}
              {showAddAttr && (
                <div className="mt-3 px-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      placeholder="Tên thuộc tính..."
                      className="flex-1 px-3 py-2 bg-white border border-gray-3 rounded-lg text-sm focus:outline-none focus:border-[#3C50E0] focus:shadow-input transition-all"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddAttribute();
                        if (e.key === "Escape") setShowAddAttr(false);
                      }}
                    />
                    <button
                      onClick={handleAddAttribute}
                      className="px-3 py-2 bg-[#3C50E0] text-white rounded-lg text-xs font-medium hover:bg-[#1C3FB7] transition-colors"
                    >
                      Thêm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Attribute Values */}
          <div className="flex-1 min-w-0">
            {/* Values Card */}
            <div className="bg-[#F7F9FC] rounded-xl p-5 mb-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-base font-bold text-dark">
                    Giá trị của &quot;{selectedAttribute?.name}&quot;
                  </h4>
                  <p className="text-xs text-[#8D93A5] mt-0.5">
                    Các biến thể{" "}
                    {isColorAttribute ? "màu sắc" : selectedAttribute?.name.toLowerCase()}{" "}
                    có sẵn cho sản phẩm.
                  </p>
                </div>
                <span className="text-sm font-semibold text-[#3C50E0]">
                  {selectedAttribute?.values.length} Giá trị
                </span>
              </div>

              {/* Value Chips */}
              <div className="flex flex-wrap gap-2.5">
                {selectedAttribute?.values.map((val) => (
                  <div
                    key={val.id}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-gray-3/70 text-sm font-medium text-dark hover:border-[#3C50E0]/30 hover:shadow-1 transition-all cursor-default group"
                  >
                    {val.color && (
                      <span
                        className="w-4 h-4 rounded-full border border-gray-3 flex-shrink-0"
                        style={{ backgroundColor: val.color }}
                      ></span>
                    )}
                    <span>{val.name}</span>
                    {/* Delete button on hover */}
                    <button
                      onClick={() => void removeValue(val.id)}
                      className="ml-1 opacity-0 group-hover:opacity-100 text-[#8D93A5] hover:text-red transition-all"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}

                {/* Add New Value Button */}
                {!showAddValue ? (
                  <button
                    onClick={() => setShowAddValue(true)}
                    className="flex items-center gap-1.5 px-4 py-2.5 border-2 border-dashed border-gray-3 rounded-xl text-sm font-medium text-[#8D93A5] hover:border-[#3C50E0] hover:text-[#3C50E0] transition-all"
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 2.5V11.5M2.5 7H11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    Thêm mới
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    {isColorAttribute && (
                      <input
                        type="color"
                        value={newValueColor}
                        onChange={(e) => setNewValueColor(e.target.value)}
                        className="w-9 h-9 rounded-lg border border-gray-3 cursor-pointer"
                      />
                    )}
                    <input
                      type="text"
                      value={newValueName}
                      onChange={(e) => setNewValueName(e.target.value)}
                      placeholder="Tên giá trị..."
                      className="px-3 py-2 bg-white border border-gray-3 rounded-lg text-sm focus:outline-none focus:border-[#3C50E0] focus:shadow-input transition-all w-[140px]"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleAddValue();
                        if (e.key === "Escape") {
                          setShowAddValue(false);
                          setNewValueName("");
                        }
                      }}
                    />
                    <button
                      onClick={handleAddValue}
                      className="px-3 py-2 bg-[#3C50E0] text-white rounded-lg text-xs font-medium hover:bg-[#1C3FB7] transition-colors"
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => {
                        setShowAddValue(false);
                        setNewValueName("");
                      }}
                      className="p-2 text-[#8D93A5] hover:text-red transition-colors"
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10.5 3.5L3.5 10.5M3.5 3.5L10.5 10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Preview Section */}
            {previewAttr && (
              <div className="bg-white rounded-xl border border-gray-3/50 p-5">
                <h4 className="text-sm font-bold text-dark mb-3">
                  Preview: {previewAttr.name}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {previewAttr.values.map((val, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 bg-[#F7F9FC] border border-gray-3 rounded-lg text-sm text-[#6C6F93] hover:border-[#3C50E0] hover:text-[#3C50E0] transition-all cursor-pointer"
                    >
                      {val.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
