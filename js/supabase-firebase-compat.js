// js/supabase-firebase-compat.js
(function () {
  const client = () => window.supabaseClient;

  // --- MOCK FIREBASE AUTH ---
  window.auth = {
    async signInWithPopup(provider) {
      if (!client()) throw new Error("Supabase client not initialized.");
      const { error } = await client().auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname
        }
      });
      if (error) throw error;
    },

    async signOut() {
      if (!client()) return;
      await client().auth.signOut();
    },

    onAuthStateChanged(callback) {
      if (!client()) return () => {};

      // Check current session
      client().auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          callback(formatUser(session.user));
        } else {
          callback(null);
        }
      });

      // Realtime listener
      const { data: { subscription } } = client().auth.onAuthStateChange((event, session) => {
        if (session && session.user) {
          callback(formatUser(session.user));
        } else {
          callback(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  };

  function formatUser(user) {
    return {
      uid: user.id,
      email: user.email,
      displayName: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0],
      photoURL: user.user_metadata?.avatar_url || user.user_metadata?.picture
    };
  }

  // --- MOCK FIRESTORE DB ---
  class DocumentReference {
    constructor(tableName, docId) {
      this.tableName = tableName;
      this.docId = docId;
    }

    async get() {
      const { data, error } = await client()
        .from(this.tableName)
        .select('*')
        .eq('id', this.docId)
        .maybeSingle();

      return {
        exists: !!data,
        data: () => data || {}
      };
    }

    async set(dataObj, options = {}) {
      const payload = { id: this.docId, ...dataObj };
      const { error } = await client().from(this.tableName).upsert(payload);
      if (error) throw error;
    }

    async update(dataObj) {
      const { error } = await client().from(this.tableName).update(dataObj).eq('id', this.docId);
      if (error) throw error;
    }

    async delete() {
      const { error } = await client().from(this.tableName).delete().eq('id', this.docId);
      if (error) throw error;
    }

    collection(subCollectionName) {
      return new CollectionReference(`${this.tableName}_${subCollectionName}`, this.docId);
    }
  }

  class CollectionReference {
    constructor(tableName, parentId = null) {
      this.tableName = tableName;
      this.parentId = parentId;
      this.orderByField = null;
      this.orderByDir = 'asc';
    }

    doc(id) {
      const docId = id || 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
      return new DocumentReference(this.tableName, docId);
    }

    orderBy(field, direction = 'asc') {
      this.orderByField = field;
      this.orderByDir = direction;
      return this;
    }

    async get() {
      let query = client().from(this.tableName).select('*');
      if (this.parentId) query = query.eq('parent_id', this.parentId);
      if (this.orderByField) query = query.order(this.orderByField, { ascending: this.orderByDir === 'asc' });

      const { data, error } = await query;
      if (error) console.warn(`Supabase fetch error for table '${this.tableName}':`, error);

      const docs = (data || []).map(item => ({
        id: item.id,
        data: () => item
      }));

      return {
        empty: docs.length === 0,
        docs: docs,
        forEach: (cb) => docs.forEach(cb)
      };
    }

    onSnapshot(callback) {
      // Execute initial fetch
      this.get().then(snapshot => callback(snapshot));

      // Subscribe to Realtime Postgres Changes
      const channel = client()
        .channel(`public:${this.tableName}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: this.tableName }, () => {
          this.get().then(snapshot => callback(snapshot));
        })
        .subscribe();

      return () => client().removeChannel(channel);
    }
  }

  window.db = {
    collection(tableName) {
      return new CollectionReference(tableName);
    },
    batch() {
      const operations = [];
      return {
        update(docRef, data) { operations.push(() => docRef.update(data)); },
        set(docRef, data, opts) { operations.push(() => docRef.set(data, opts)); },
        delete(docRef) { operations.push(() => docRef.delete()); },
        async commit() {
          for (const op of operations) {
            await op();
          }
        }
      };
    }
  };
})();