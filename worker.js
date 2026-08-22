export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    // 1. BUSCAR PRODUTOS (Lê do banco ANTIGO que tem os 3000 produtos)
    if (path === '/api/produtos' && request.method === 'GET') {
      const loja = url.searchParams.get('loja') || 'Shopee';
      const nicho = url.searchParams.get('nicho') || 'geral';
      
      let query = `SELECT * FROM produtos WHERE loja = ? ORDER BY criado_em DESC LIMIT 20`;
      let stmt = env.DB_COLEPOSTE.prepare(query).bind(loja);

      if (nicho !== 'geral') {
        query = `SELECT * FROM produtos WHERE loja = ? AND nicho = ? ORDER BY criado_em DESC LIMIT 20`;
        stmt = env.DB_COLEPOSTE.prepare(query).bind(loja, nicho);
      }

      const { results } = await stmt.all();
      return Response.json(results);
    }

    // 2. CONSULTAR CRÉDITOS (Lê do KV)
    if (path === '/api/creditos' && request.method === 'GET') {
      const email = url.searchParams.get('email');
      const dados = await env.KV_CREDITOS.get(email, { type: 'json' });
      return Response.json(dados || { creditos: 0, plano: 'basico' });
    }

    // 3. GASTAR CRÉDITO (Atualiza o KV)
    if (path === '/api/gastar-credito' && request.method === 'POST') {
      const { email } = await request.json();
      let dados = await env.KV_CREDITOS.get(email, { type: 'json' }) || { creditos: 0 };
      
      if (dados.creditos > 0) {
        dados.creditos -= 1;
        await env.KV_CREDITOS.put(email, JSON.stringify(dados));
        return Response.json({ sucesso: true, creditos: dados.creditos });
      }
      return Response.json({ sucesso: false, erro: 'Créditos insuficientes' }, { status: 400 });
    }

    // 4. SALVAR FAVORITO (Escreve no banco NOVO)
    if (path === '/api/favoritos' && request.method === 'POST') {
      const { email, produto_id } = await request.json();
      
      // Cria a tabela de favoritos no banco novo se ela não existir
      await env.DB.prepare(`
        CREATE TABLE IF NOT EXISTS favoritos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT,
          produto_id INTEGER,
          data DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      await env.DB.prepare(
        `INSERT INTO favoritos (email, produto_id, data) VALUES (?, ?, datetime('now'))`
      ).bind(email, produto_id).run();
      
      return Response.json({ sucesso: true });
    }

    return new Response('Rota não encontrada', { status: 404 });
  }
};
