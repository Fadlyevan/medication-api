import { supabase } from "../config/supabaseClient.js";

export const MedicationModel = {
    async getAll() {
        const { data, error } = await supabase
            .from("medications")
            .select("id, sku, name, description, price, quantity, category_id, supplier_id");

        if (error) throw error;
        return data;
    },

    async getById(id) {
        const { data, error } = await supabase
            .from("medications")
            .select(`
                id, sku, name, description, price, quantity,
                categories ( id, name ),
                suppliers ( id, name, email, phone )
            `)
            .eq("id", id)
            .single();

        if (error) throw error;
        return data;
    },

    async create(payload) {
        // 🔹 kalau payload belum punya SKU → generate otomatis
        if (!payload.sku) {
            const last = await this.getLast();
            const lastNumber = last
                ? parseInt(last.sku.replace("MED", "")) || 0
                : 0;

            payload.sku = `MED${String(lastNumber + 1).padStart(3, "0")}`;
        }

        const { data, error } = await supabase
            .from("medications")
            .insert([payload])
            .select();

        if (error) throw error;
        return data[0];
    },

    async update(id, payload) {
        const { data, error } = await supabase
            .from("medications")
            .update(payload)
            .eq("id", id)
            .select();

        if (error) throw error;
        return data[0];
    },

    async remove(id) {
        const { error } = await supabase
            .from("medications")
            .delete()
            .eq("id", id);

        if (error) throw error;
        return { success: true };
    },

    // 🔹 method tambahan untuk ambil record terakhir (buat generate SKU)
    async getLast() {
        const { data, error } = await supabase
            .from("medications")
            .select("sku")
            .order("id", { ascending: false })
            .limit(1);

        if (error) throw error;
        return data.length ? data[0] : null;
    }
};
