import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function GameScreen() {
  const [posicao, setPosicao] = useState({ x: 50, y: 50 });
  const [comandoTexto, setComandoTexto] = useState('');
  const [status, setStatus] = useState('Waiting for commands...');
  
  const executando = useRef(false);
  const passo = 40;

  const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const pararExecucao = () => {
    executando.current = false;
    setStatus('Execution interrupted!');
  };

  const executarCodigo = async () => {
    if (executando.current || comandoTexto.trim() === '') return;
    
    executando.current = true;
    setStatus('Running program...');

    // Regex para capturar o que está dentro de repetir { ... }
    const loopMatch = comandoTexto.match(/repetir\s*\{([\s\S]*)\}/i);
    let comandosParaRodar = [];
    let emLoop = false;

    if (loopMatch) {
      // Pega os comandos de dentro das chaves
      comandosParaRodar = loopMatch[1].split('\n').filter(l => l.trim() !== '');
      emLoop = true;
    } else {
      // Se não tem chaves, roda os comandos normalmente uma vez
      comandosParaRodar = comandoTexto.split('\n').filter(l => l.trim() !== '');
    }

    try {
      do {
        for (const linha of comandosParaRodar) {
          if (!executando.current) break;

          const textoLimpo = linha.trim().toLowerCase();
          const match = textoLimpo.match(/(\w+)\((\d*)\)/);

          if (match) {
            const comando = match[1];
            const vezes = match[2] === "" ? 1 : parseInt(match[2]);

            for (let i = 0; i < vezes; i++) {
              if (!executando.current) break;
              await esperar(200);

              setPosicao((atual) => {
                if (comando === 'subir') return { ...atual, y: atual.y - passo };
                if (comando === 'descer') return { ...atual, y: atual.y + passo };
                if (comando === 'esquerda') return { ...atual, x: atual.x - passo };
                if (comando === 'direita') return { ...atual, x: atual.x + passo };
                return atual;
              });
            }
          }
        }
        if (emLoop) await esperar(100);
      } while (emLoop && executando.current);

    } finally {
      setComandoTexto(''); 
      setStatus(executando.current ? 'Mission accomplished!' : 'Execution stopped!');
      executando.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.areaJogo}>
        <View style={[styles.robo, { left: posicao.x, top: posicao.y }]} />
      </View>

      <View style={styles.terminalContainer}>
        <Text style={styles.tituloTerminal}>TERMINAL CONSOLE</Text>
        <Text style={styles.statusTexto}>{status}</Text>
        
        <TextInput
          multiline
          style={styles.inputTerminal}
          placeholder="direita() / direita(1) / descer() / subir() / Função de repetir algo: repetir{ Comandos aqui dentro! }"
          placeholderTextColor="#555"
          value={comandoTexto}
          onChangeText={setComandoTexto}
          autoCapitalize="none"
        />

        <View style={styles.botoesContainer}>
          <TouchableOpacity style={[styles.botaoBase, styles.botaoExecutar]} onPress={executarCodigo}>
            <Text style={styles.textoBotao}>RUN</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.botaoBase, styles.botaoStop]} onPress={pararExecucao}>
            <Text style={styles.textoBotao}>STOP</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  areaJogo: { flex: 1, borderBottomWidth: 1, borderColor: '#333' },
  robo: { width: 40, height: 40, backgroundColor: '#00D8FF', position: 'absolute', borderRadius: 4 },
  terminalContainer: { height: 280, backgroundColor: '#1e1e1e', padding: 15 },
  tituloTerminal: { color: '#00ff00', fontWeight: 'bold', marginBottom: 5 },
  statusTexto: { color: '#aaa', fontSize: 12, marginBottom: 10 },
  inputTerminal: { flex: 1, backgroundColor: '#000', color: '#00ff00', fontFamily: 'monospace', padding: 10, borderRadius: 5, textAlignVertical: 'top' },
  botoesContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  botaoBase: { flex: 1, padding: 12, borderRadius: 5, alignItems: 'center' },
  botaoExecutar: { backgroundColor: '#00D8FF' },
  botaoStop: { backgroundColor: '#FF4444' },
  textoBotao: { fontWeight: 'bold', color: '#000' },
});