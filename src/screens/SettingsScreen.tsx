import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { GameSettings, Player } from '../types';

type RootStackParamList = {
  Timer: { settings: GameSettings };
};

type NavigationProp = StackNavigationProp<RootStackParamList, 'Timer'>;

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [timerDuration, setTimerDuration] = useState('30');  // 기본값 30초로 변경
  const [players, setPlayers] = useState<Player[]>([
    { id: 1, name: '플레이어 1', timeLeft: 30, color: '#FF6B6B' },
    { id: 2, name: '플레이어 2', timeLeft: 30, color: '#4ECDC4' },
  ]);

  const handleStart = () => {
    const duration = parseFloat(timerDuration);
    if (isNaN(duration) || duration <= 0) {
      alert('올바른 시간(초)을 입력해주세요.');
      return;
    }

    const settings: GameSettings = {
      timerDuration: duration,
      players: players.map(player => ({
        ...player,
        timeLeft: duration,
      })),
    };

    navigation.navigate('Timer', { settings });
  };

  const handlePlayerNameChange = (index: number, name: string) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      newPlayers[index].name = name;
      return newPlayers;
    });
  };

  const handlePlayerColorChange = (index: number, color: string) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      newPlayers[index].color = color;
      return newPlayers;
    });
  };

  const handleAddPlayer = () => {
    if (players.length >= 4) {
      alert('최대 4명까지 추가할 수 있습니다.');
      return;
    }

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
    setPlayers(prevPlayers => [
      ...prevPlayers,
      {
        id: prevPlayers.length + 1,
        name: `플레이어 ${prevPlayers.length + 1}`,
        timeLeft: parseFloat(timerDuration),
        color: colors[prevPlayers.length],
      },
    ]);
  };

  const handleRemovePlayer = () => {
    if (players.length <= 2) {
      alert('최소 2명이 필요합니다.');
      return;
    }

    setPlayers(prevPlayers => prevPlayers.slice(0, -1));
  };

  // 시간 표시 형식 변환 (초 -> 분:초)
  const formatTime = (seconds: string): string => {
    const totalSeconds = parseFloat(seconds);
    if (isNaN(totalSeconds)) return '00:00';
    
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = Math.floor(totalSeconds % 60);
    
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>시간 설정 (초)</Text>
            <View style={styles.timeInputContainer}>
              <TextInput
                style={styles.input}
                value={timerDuration}
                onChangeText={setTimerDuration}
                keyboardType="numeric"
                placeholder="시간을 초 단위로 입력하세요"
              />
              <Text style={styles.timeDisplay}>
                {formatTime(timerDuration)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>플레이어 설정</Text>
            {players.map((player, index) => (
              <View key={index} style={styles.playerContainer}>
                <TextInput
                  style={styles.playerInput}
                  value={player.name}
                  onChangeText={(text) => handlePlayerNameChange(index, text)}
                  placeholder="플레이어 이름"
                />
                <TouchableOpacity
                  style={[styles.colorButton, { backgroundColor: player.color }]}
                  onPress={() => {
                    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
                    const currentIndex = colors.indexOf(player.color);
                    const nextIndex = (currentIndex + 1) % colors.length;
                    handlePlayerColorChange(index, colors[nextIndex]);
                  }}
                />
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.addButton]}
              onPress={handleAddPlayer}
            >
              <Text style={styles.buttonText}>플레이어 추가</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.removeButton]}
              onPress={handleRemovePlayer}
            >
              <Text style={styles.buttonText}>플레이어 제거</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.startButton]}
            onPress={handleStart}
          >
            <Text style={styles.buttonText}>시작</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262626',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  contentWrapper: {
    width: '100%',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  timeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 2,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginRight: 10,
  },
  timeDisplay: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 15,
    borderRadius: 10,
    textAlign: 'center',
  },
  playerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  playerInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    fontSize: 16,
  },
  colorButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    flex: 1,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: '#FF6B6B',
    flex: 1,
    marginLeft: 10,
  },
  startButton: {
    backgroundColor: '#45B7D1',
    width: '100%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 