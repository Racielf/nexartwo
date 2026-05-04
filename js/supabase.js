// ============================================================
// WOIMS — Supabase Client & Database API
// ============================================================
// INSTRUCTIONS: Replace SUPABASE_URL and SUPABASE_ANON_KEY
// with your project credentials from:
// Supabase Dashboard → Settings → API
// ============================================================

const SUPABASE_URL = 'https://udaeifoibydcokefcmbg.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8n5oHdP9MhT3hsZf-IRqiw__b4qcTfC';

let _sb = null;
let _supabaseReady = false;

function getSupabase() {
  if (_sb) return _sb;
  if (typeof supabase === 'undefined' || !supabase.createClient) return null;
  if (SUPABASE_URL.includes('%%') || SUPABASE_ANON_KEY.includes('%%')) {
    console.warn('Supabase credentials not configured. Using localStorage fallback.');
    return null;
  }
  try {
    _sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    _supabaseReady = true;
    return _sb;
  } catch (e) {
    console.error('Supabase init error:', e);
    return null;
  }
}

function isSupabaseReady() {
  return _supabaseReady && _sb !== null;
}

// ============================================================
// DATABASE API
// ============================================================
const DB = {

  // ---------- CLIENTS ----------
  clients: {
    async getAll() {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('clients').select('*').order('id', { ascending: true });
      if (error) { console.error('DB clients.getAll:', error); return null; }
      return data.map(function(r) {
        return {
          id: r.id, name: r.name, type: r.type, email: r.email,
          phone: r.phone, address: r.address, referral: r.referral,
          lang: r.lang, payment: r.payment, tags: r.tags, notes: r.notes,
          properties: r.properties || 0,
          totalOrders: r.total_orders || 0,
          totalValue: parseFloat(r.total_value) || 0
        };
      });
    },

    async create(c) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('clients').insert({
        name: c.name, type: c.type, email: c.email, phone: c.phone,
        address: c.address || '', referral: c.referral || '',
        lang: c.lang || 'English', payment: c.payment || 'Net 30',
        tags: c.tags || '', notes: c.notes || '',
        properties: c.properties || 0,
        total_orders: c.totalOrders || 0,
        total_value: c.totalValue || 0
      }).select().single();
      if (error) { console.error('DB clients.create:', error); return null; }
      return data;
    },

    async update(id, changes) {
      var sb = getSupabase();
      if (!sb) return false;
      var row = {};
      if ('name' in changes) row.name = changes.name;
      if ('type' in changes) row.type = changes.type;
      if ('email' in changes) row.email = changes.email;
      if ('phone' in changes) row.phone = changes.phone;
      if ('address' in changes) row.address = changes.address;
      if ('referral' in changes) row.referral = changes.referral;
      if ('lang' in changes) row.lang = changes.lang;
      if ('payment' in changes) row.payment = changes.payment;
      if ('tags' in changes) row.tags = changes.tags;
      if ('notes' in changes) row.notes = changes.notes;
      if ('properties' in changes) row.properties = changes.properties;
      if ('totalOrders' in changes) row.total_orders = changes.totalOrders;
      if ('totalValue' in changes) row.total_value = changes.totalValue;
      row.updated_at = new Date().toISOString();
      var { error } = await sb.from('clients').update(row).eq('id', id);
      if (error) { console.error('DB clients.update:', error); return false; }
      return true;
    },

    async delete(id) {
      var sb = getSupabase();
      if (!sb) return false;
      var { error } = await sb.from('clients').delete().eq('id', id);
      if (error) { console.error('DB clients.delete:', error); return false; }
      return true;
    }
  },

  // ---------- SERVICES ----------
  services: {
    async getAll() {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('services').select('*').order('id', { ascending: true });
      if (error) { console.error('DB services.getAll:', error); return null; }
      return data.map(function(r) {
        return {
          id: r.id, name: r.name, nameEs: r.name_es || '',
          category: r.category, sub: r.sub,
          price: parseFloat(r.price) || 0,
          unit: r.unit, desc: r.description || '',
          negotiable: r.negotiable || 'yes',
          laborHrs: parseFloat(r.labor_hrs) || 1
        };
      });
    },

    async create(s) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('services').insert({
        name: s.name, name_es: s.nameEs || '',
        category: s.category, sub: s.sub,
        price: s.price, unit: s.unit,
        description: s.desc || '',
        negotiable: s.negotiable || 'yes',
        labor_hrs: s.laborHrs || 1
      }).select().single();
      if (error) { console.error('DB services.create:', error); return null; }
      return data;
    },

    async bulkInsert(services) {
      var sb = getSupabase();
      if (!sb) return false;
      var rows = services.map(function(s) {
        return {
          name: s.name, name_es: s.nameEs || '',
          category: s.category, sub: s.sub,
          price: s.price, unit: s.unit,
          description: s.desc || '',
          negotiable: s.negotiable || 'yes',
          labor_hrs: s.laborHrs || 1
        };
      });
      var { error } = await sb.from('services').insert(rows);
      if (error) { console.error('DB services.bulkInsert:', error); return false; }
      return true;
    }
  },

  // ---------- WORK ORDERS ----------
  workOrders: {
    async getAll() {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('work_orders').select('*').order('created_at', { ascending: false });
      if (error) { console.error('DB workOrders.getAll:', error); return null; }
      return data.map(function(r) {
        return {
          id: r.id, title: r.title,
          client: r.client_name, clientId: r.client_id,
          property: r.property, type: r.type,
          status: r.status, priority: r.priority,
          created: r.created_date, target: r.target_date || '',
          items: r.items || 0,
          total: parseFloat(r.total) || 0,
          completed: r.completed || 0
        };
      });
    },

    async create(wo) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('work_orders').insert({
        id: wo.id, title: wo.title,
        client_name: wo.client, client_id: wo.clientId || null,
        property: wo.property, type: wo.type,
        status: wo.status, priority: wo.priority,
        created_date: wo.created,
        target_date: wo.target || null,
        items: wo.items || 0,
        total: wo.total || 0,
        completed: wo.completed || 0
      }).select().single();
      if (error) { console.error('DB workOrders.create:', error); return null; }
      return data;
    },

    async update(id, changes) {
      var sb = getSupabase();
      if (!sb) return false;
      var row = {};
      if ('title' in changes) row.title = changes.title;
      if ('client' in changes) row.client_name = changes.client;
      if ('clientId' in changes) row.client_id = changes.clientId;
      if ('property' in changes) row.property = changes.property;
      if ('status' in changes) row.status = changes.status;
      if ('priority' in changes) row.priority = changes.priority;
      if ('target' in changes) row.target_date = changes.target;
      if ('items' in changes) row.items = changes.items;
      if ('total' in changes) row.total = changes.total;
      if ('completed' in changes) row.completed = changes.completed;
      row.updated_at = new Date().toISOString();
      var { error } = await sb.from('work_orders').update(row).eq('id', id);
      if (error) { console.error('DB workOrders.update:', error); return false; }
      return true;
    },

    async delete(id) {
      var sb = getSupabase();
      if (!sb) return false;
      var { error } = await sb.from('work_orders').delete().eq('id', id);
      if (error) { console.error('DB workOrders.delete:', error); return false; }
      return true;
    }
  },

  // ---------- COMPANY SETTINGS ----------
  company: {
    async get() {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('company_settings').select('*').limit(1).single();
      if (error && error.code !== 'PGRST116') { console.error('DB company.get:', error); return null; }
      if (!data) return null;
      return {
        name: data.name, owner: data.owner,
        phone: data.phone, email: data.email,
        city: data.city, state: data.state,
        ccb: data.ccb, founded: data.founded,
        address: data.address,
        logo_url: data.logo_url || '',
        app_logo_url: data.app_logo_url || ''
      };
    },

    async save(settings) {
      var sb = getSupabase();
      if (!sb) return false;
      var row = {
        name: settings.name || '', owner: settings.owner || '',
        phone: settings.phone || '', email: settings.email || '',
        city: settings.city || '', state: settings.state || '',
        ccb: settings.ccb || '', founded: settings.founded || '',
        address: settings.address || '',
        logo_url: settings.logo_url || '',
        app_logo_url: settings.app_logo_url || '',
        updated_at: new Date().toISOString()
      };
      // Try update first, then insert
      var { data: existing } = await sb.from('company_settings').select('id').limit(1).single();
      if (existing) {
        var { error } = await sb.from('company_settings').update(row).eq('id', existing.id);
        if (error) { console.error('DB company.save update:', error); return false; }
      } else {
        var { error } = await sb.from('company_settings').insert(row);
        if (error) { console.error('DB company.save insert:', error); return false; }
      }
      return true;
    }
  },

  // ---------- LOGO STORAGE ----------
  logos: {
    async upload(file, filename) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.storage.from('logos').upload(filename, file, {
        cacheControl: '3600',
        upsert: true
      });
      if (error) { console.error('DB logos.upload:', error); return null; }
      var { data: urlData } = sb.storage.from('logos').getPublicUrl(filename);
      return urlData.publicUrl;
    }
  },

  // ---------- LINE ITEMS (Phase 2) ----------
  lineItems: {
    async getByWO(workOrderId) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('wo_line_items').select('*')
        .eq('work_order_id', workOrderId)
        .order('sort_order', { ascending: true });
      if (error) { console.error('DB lineItems.getByWO:', error); return null; }
      return data.map(function(r) {
        return {
          id: r.id, workOrderId: r.work_order_id, serviceId: r.service_id,
          name: r.name, nameEs: r.name_es || '', desc: r.description || '',
          category: r.category, sub: r.sub,
          price: parseFloat(r.price) || 0, qty: parseFloat(r.qty) || 1,
          unit: r.unit, negotiable: r.negotiable || 'yes',
          laborHrs: parseFloat(r.labor_hrs) || 1,
          status: r.status || 'pending',
          completedAt: r.completed_at, completedBy: r.completed_by || '',
          notes: r.notes || '', sortOrder: r.sort_order || 0
        };
      });
    },

    async create(item) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('wo_line_items').insert({
        work_order_id: item.workOrderId,
        service_id: item.serviceId || null,
        name: item.name, name_es: item.nameEs || '',
        description: item.desc || '',
        category: item.category || '', sub: item.sub || '',
        price: item.price || 0, qty: item.qty || 1,
        unit: item.unit || 'each', negotiable: item.negotiable || 'yes',
        labor_hrs: item.laborHrs || 1,
        status: item.status || 'pending',
        notes: item.notes || '',
        sort_order: item.sortOrder || 0
      }).select().single();
      if (error) { console.error('DB lineItems.create:', error); return null; }
      return data;
    },

    async update(id, changes) {
      var sb = getSupabase();
      if (!sb) return false;
      var row = {};
      if ('status' in changes) row.status = changes.status;
      if ('completedAt' in changes) row.completed_at = changes.completedAt;
      if ('completedBy' in changes) row.completed_by = changes.completedBy;
      if ('price' in changes) row.price = changes.price;
      if ('qty' in changes) row.qty = changes.qty;
      if ('notes' in changes) row.notes = changes.notes;
      if ('name' in changes) row.name = changes.name;
      if ('desc' in changes) row.description = changes.desc;
      if ('sortOrder' in changes) row.sort_order = changes.sortOrder;
      var { error } = await sb.from('wo_line_items').update(row).eq('id', id);
      if (error) { console.error('DB lineItems.update:', error); return false; }
      return true;
    },

    async delete(id) {
      var sb = getSupabase();
      if (!sb) return false;
      var { error } = await sb.from('wo_line_items').delete().eq('id', id);
      if (error) { console.error('DB lineItems.delete:', error); return false; }
      return true;
    }
  },

  // ---------- DOCUMENTS (Phase 2) ----------
  documents: {
    async getAll() {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('documents').select('*').order('created_at', { ascending: false });
      if (error) { console.error('DB documents.getAll:', error); return null; }
      return data;
    },

    async create(doc) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('documents').insert({
        doc_number: doc.doc_number, type: doc.type,
        work_order_id: doc.work_order_id, client_name: doc.client_name || '',
        status: doc.status || 'draft', style: doc.style || 'classic',
        hide_prices: doc.hide_prices || false, notes: doc.notes || ''
      }).select().single();
      if (error) { console.error('DB documents.create:', error); return null; }
      return data;
    },

    async update(id, changes) {
      var sb = getSupabase();
      if (!sb) return false;
      var { error } = await sb.from('documents').update(changes).eq('id', id);
      if (error) { console.error('DB documents.update:', error); return false; }
      return true;
    }
  },

  // ---------- COMMUNICATIONS (Phase 2) ----------
  communications: {
    async getByWO(workOrderId) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('wo_communications').select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      if (error) { console.error('DB communications.getByWO:', error); return null; }
      return data;
    },

    async create(comm) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('wo_communications').insert({
        work_order_id: comm.work_order_id,
        type: comm.type || 'note',
        subject: comm.subject || '',
        body: comm.body || '',
        sender: comm.sender || '',
        recipient: comm.recipient || ''
      }).select().single();
      if (error) { console.error('DB communications.create:', error); return null; }
      return data;
    }
  },

  // ---------- CHANGE ORDERS (Phase 2) ----------
  changeOrders: {
    async getByWO(workOrderId) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('change_orders').select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      if (error) { console.error('DB changeOrders.getByWO:', error); return null; }
      return data;
    },

    async create(co) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('change_orders').insert({
        co_number: co.co_number,
        work_order_id: co.work_order_id,
        description: co.description || '',
        items: co.items || [],
        amount: co.amount || 0,
        status: co.status || 'proposed',
        requested_by: co.requested_by || ''
      }).select().single();
      if (error) { console.error('DB changeOrders.create:', error); return null; }
      return data;
    },

    async update(id, changes) {
      var sb = getSupabase();
      if (!sb) return false;
      var { error } = await sb.from('change_orders').update(changes).eq('id', id);
      if (error) { console.error('DB changeOrders.update:', error); return false; }
      return true;
    }
  },

  // ---------- PHOTOS (Phase 2) ----------
  photos: {
    async getByWO(workOrderId) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('wo_photos').select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false });
      if (error) { console.error('DB photos.getByWO:', error); return null; }
      return data;
    },

    async create(photo) {
      var sb = getSupabase();
      if (!sb) return null;
      var { data, error } = await sb.from('wo_photos').insert({
        work_order_id: photo.work_order_id,
        type: photo.type || 'before',
        label: photo.label || '',
        area: photo.area || '',
        photo_url: photo.photo_url || '',
        gps_lat: photo.gps_lat || null,
        gps_lng: photo.gps_lng || null,
        taken_by: photo.taken_by || ''
      }).select().single();
      if (error) { console.error('DB photos.create:', error); return null; }
      return data;
    },

    async uploadFile(file, workOrderId) {
      var sb = getSupabase();
      if (!sb) return null;
      var filename = workOrderId + '/' + Date.now() + '_' + file.name;
      var { data, error } = await sb.storage.from('photos').upload(filename, file, {
        cacheControl: '3600', upsert: false
      });
      if (error) { console.error('DB photos.uploadFile:', error); return null; }
      var { data: urlData } = sb.storage.from('photos').getPublicUrl(filename);
      return urlData.publicUrl;
    }
  },

  // ---------- SEED DEFAULTS ----------
  async seedIfEmpty() {
    var sb = getSupabase();
    if (!sb) return;
    // Check if services table is empty
    var { count } = await sb.from('services').select('id', { count: 'exact', head: true });
    if (count === 0 && typeof _DEFAULT_SERVICES !== 'undefined') {
      console.log('Seeding default services...');
      await this.services.bulkInsert(_DEFAULT_SERVICES);
    }
    // Check if clients table is empty
    var { count: cCount } = await sb.from('clients').select('id', { count: 'exact', head: true });
    if (cCount === 0 && typeof _DEFAULT_CLIENTS !== 'undefined') {
      console.log('Seeding default clients...');
      for (var i = 0; i < _DEFAULT_CLIENTS.length; i++) {
        await this.clients.create(_DEFAULT_CLIENTS[i]);
      }
    }
    // Check if work orders table is empty
    var { count: wCount } = await sb.from('work_orders').select('id', { count: 'exact', head: true });
    if (wCount === 0 && typeof _DEFAULT_WORK_ORDERS !== 'undefined') {
      console.log('Seeding default work orders...');
      for (var i = 0; i < _DEFAULT_WORK_ORDERS.length; i++) {
        await this.workOrders.create(_DEFAULT_WORK_ORDERS[i]);
      }
    }
  }
};

