import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function GameScreen() {
  const [posicao, setPosicao] = useState({ x: 50, y: 50 });
  const [comandoTexto, setComandoTexto] = useState(''); // O que o usuário digita
  const [status, setStatus] = useState('Aguardando comandos...');
  const passo = 40;

  // Função para esperar (delay) entre os movimentos
  const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const executarCodigo = async () => {
    const linhas = comandoTexto.split('\n').filter(l => l.trim() !== '');
    const querRepetir = comandoTexto.toLowerCase().includes('repetir()');
    
    setStatus('Executando programa...');

    // O loop 'do...while' garante que execute pelo menos uma vez
    // e continue se houver 'repetir()' no texto
    do {
      for (const linha of linhas) {
        const textoLimpo = linha.trim().toLowerCase();
        
        // 1. REGEX: Procura algo como "nome(numero)" ou "nome()"
        const match = textoLimpo.match(/(\w+)\((\d*)\)/);

        if (match) {
          const comando = match[1];
          const vezes = match[2] === "" ? 1 : parseInt(match[2]);

          for (let i = 0; i < vezes; i++) {
            await esperar(300);

            setPosicao((atual) => {
              if (comando === 'subir') return { ...atual, y: atual.y - passo };
              if (comando === 'descer') return { ...atual, y: atual.y + passo };
              if (comando === 'esquerda') return { ...atual, x: atual.x - passo };
              if (comando === 'direita') return { ...atual, x: atual.x + passo };
              return atual;
            });
          }
        } else if (textoLimpo !== 'repetir()') {
          setStatus(`Erro de sintaxe em: ${linha}`);
          return; // Para tudo se houver erro
        }
      }
      
      // Pequena pausa entre ciclos de repetição para não travar
      if (querRepetir) await esperar(100);

    } while (querRepetir);
    
    setComandoTexto(''); // Limpa o terminal ao finalizar
    setStatus('Missão cumprida!');
  };

  return (
    <View style={styles.container}>
      {/* AREA DO JOGO (GRID) */}
      <View style={styles.areaJogo}>
        <View style={[styles.robo, { left: posicao.x, top: posicao.y }]} />
      </View>

      {/* TERMINAL NA PARTE DE BAIXO */}
      <View style={styles.terminalContainer}>
        <Text style={styles.tituloTerminal}>CONSOLE TERMINAL</Text>
        <Text style={styles.statusTexto}>{status}</Text>
        
        <TextInput
          multiline
          style={styles.inputTerminal}
          placeholder="Ex: direita() / subir() / repetir() para criar um loop"
          placeholderTextColor="#555"
          value={comandoTexto}
          onChangeText={setComandoTexto}
          autoCapitalize="none"
        />

        <TouchableOpacity style={styles.botaoExecutar} onPress={executarCodigo}>
          <Text style={styles.textoBotao}>EXECUTAR PROGRAMA</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  areaJogo: { flex: 1, borderBottomWidth: 1, borderColor: '#333' },
  robo: {
    width: 40,
    height: 40,
    backgroundColor: '#00D8FF',
    position: 'absolute',
    borderRadius: 4,
  },
  terminalContainer: {
    height: 250,
    backgroundColor: '#1e1e1e',
    padding: 15,
  },
  tituloTerminal: { color: '#00ff00', fontWeight: 'bold', marginBottom: 5 },
  statusTexto: { color: '#aaa', fontSize: 12, marginBottom: 10 },
  inputTerminal: {
    flex: 1,
    backgroundColor: '#000',
    color: '#00ff00',
    fontFamily: 'monospace',
    padding: 10,
    borderRadius: 5,
    textAlignVertical: 'top',
  },
  botaoExecutar: {
    backgroundColor: '#00D8FF',
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
    alignItems: 'center',
  },
  textoBotao: { fontWeight: 'bold', color: '#000' },
});