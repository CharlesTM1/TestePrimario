import React, { useState, useRef } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function GameScreen() {
  const [posicao, setPosicao] = useState({ x: 50, y: 50 });
  const [comandoTexto, setComandoTexto] = useState('');
  const [status, setStatus] = useState('Aguardando comandos...');
  
  // 1. Chave de controle: useRef mantém o valor entre renderizações sem resetar
  const executando = useRef(false);
  const passo = 40;

  const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // 2. Função para desligar a chave
  const pararExecucao = () => {
    executando.current = false;
    setStatus('Execução interrompida!');
  };

  const executarCodigo = async () => {
    if (executando.current) return; // Evita rodar dois ao mesmo tempo
    
    executando.current = true;
    const linhas = comandoTexto.split('\n').filter(l => l.trim() !== '');
    const querRepetir = comandoTexto.toLowerCase().includes('repetir()');
    
    setStatus('Executando programa...');

    do {
      for (const linha of linhas) {
        // 3. Verificação crítica: se a chave desligar, sai do loop imediatamente
        if (!executando.current) break;

        const textoLimpo = linha.trim().toLowerCase();
        const match = textoLimpo.match(/(\w+)\((\d*)\)/);

        if (match) {
          const comando = match[1];
          const vezes = match[2] === "" ? 1 : parseInt(match[2]);

          for (let i = 0; i < vezes; i++) {
            if (!executando.current) break; // Checa de novo dentro do laço de repetição
            await esperar(200);

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
          executando.current = false;
          return;
        }
      }
      
      if (querRepetir) await esperar(100);

    } while (querRepetir && executando.current); // Só repete se a chave estiver ligada
    
    if (executando.current) {
      setComandoTexto(''); 
      setStatus('Missão cumprida!');
    }
    
    executando.current = false; // Desliga a chave ao final
  };

  return (
    <View style={styles.container}>
      <View style={styles.areaJogo}>
        <View style={[styles.robo, { left: posicao.x, top: posicao.y }]} />
      </View>

      <View style={styles.terminalContainer}>
        <Text style={styles.tituloTerminal}>CONSOLE TERMINAL</Text>
        <Text style={styles.statusTexto}>{status}</Text>
        
        <TextInput
          multiline
          style={styles.inputTerminal}
          placeholder="Ex: direita(3)\nrepetir()"
          placeholderTextColor="#555"
          value={comandoTexto}
          onChangeText={setComandoTexto}
          autoCapitalize="none"
        />

        {/* 4. Layout com dois botões lado a lado */}
        <View style={styles.botoesContainer}>
          <TouchableOpacity 
            style={[styles.botaoBase, styles.botaoExecutar]} 
            onPress={executarCodigo}
          >
            <Text style={styles.textoBotao}>EXECUTAR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.botaoBase, styles.botaoStop]} 
            onPress={pararExecucao}
          >
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
  botoesContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  botaoBase: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  botaoExecutar: {
    backgroundColor: '#00D8FF',
  },
  botaoStop: {
    backgroundColor: '#FF4444', // Vermelho para o Stop
  },
  textoBotao: { fontWeight: 'bold', color: '#000' },
});