import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { GameSettings, Player } from '../types';

const { height, width } = Dimensions.get('window');
const SCREEN_HEIGHT = Math.min(height, 1200);

// 네비게이션 타입 정의
type RootStackParamList = {
  Timer: { settings: GameSettings };
  Settings: undefined;
  Pause: { currentPlayer: Player; settings: GameSettings };
};

type TimerScreenRouteProp = RouteProp<RootStackParamList, 'Timer'>;
type TimerScreenNavigationProp = StackNavigationProp<RootStackParamList>;

export default function TimerScreen() {
  const navigation = useNavigation<TimerScreenNavigationProp>();
  const route = useRoute<TimerScreenRouteProp>();
  const { settings } = route.params;
  
  const [players, setPlayers] = useState<Player[]>(settings.players);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [lastTapTime, setLastTapTime] = useState(0);
  const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // 타이머 채우기 높이 애니메이션
  const fillHeightAnim = useRef(new Animated.Value(100)).current;

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentPlayerIndex]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const initialTime = players[currentPlayerIndex].timeLeft;
    const totalDuration = settings.timerDuration;
    
    // 처음 시작할 때 높이 비율 설정
    const initialPercentage = (initialTime / totalDuration) * 100;
    fillHeightAnim.setValue(initialPercentage);
    
    timerRef.current = setInterval(() => {
      setPlayers((prevPlayers) => {
        const newPlayers = [...prevPlayers];
        const currentPlayer = newPlayers[currentPlayerIndex];
        
        if (currentPlayer.timeLeft > 0) {
          currentPlayer.timeLeft -= 0.01;
          
          // 타이머 진행에 따라 높이 애니메이션 업데이트
          const percentage = (currentPlayer.timeLeft / totalDuration) * 100;
          fillHeightAnim.setValue(percentage);
          
          if (currentPlayer.timeLeft <= 5 && currentPlayer.timeLeft > 0) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Animated.sequence([
              Animated.timing(fadeAnim, {
                toValue: 0.5,
                duration: 250,
                useNativeDriver: true,
              }),
              Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 250,
                useNativeDriver: true,
              }),
            ]).start();
          }
          
          if (currentPlayer.timeLeft <= 0) {
            currentPlayer.timeLeft = 0;
            handleTimerEnd();
          }
        }
        
        return newPlayers;
      });
    }, 10);
  };

  const handleTimerEnd = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setShowTimeoutMessage(true);
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const animation = Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);
    
    // 애니메이션 2번 반복
    Animated.loop(animation, { iterations: 2 }).start();
  };

  const handlePress = () => {
    const now = Date.now();
    if (now - lastTapTime < 300) {
      handleDoubleTap();
    } else {
      handleSingleTap();
    }
    setLastTapTime(now);
  };

  const handleSingleTap = () => {
    // 타이머가 종료된 메시지를 숨김
    if (showTimeoutMessage) {
      setShowTimeoutMessage(false);
    }
    
    // 다음 선수로 넘어갈 때 타이머 초기화
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      newPlayers[nextIndex].timeLeft = settings.timerDuration;
      return newPlayers;
    });
    
    // 다음 선수 인덱스로 설정
    setCurrentPlayerIndex((prevIndex) => 
      (prevIndex + 1) % players.length
    );
    
    // 타이머 높이 리셋
    fillHeightAnim.setValue(100);
    
    // 타이머 시작
    if (!isRunning) {
      setIsRunning(true);
    }
  };

  const handleDoubleTap = () => {
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      newPlayers[currentPlayerIndex].timeLeft = settings.timerDuration;
      return newPlayers;
    });
    
    // 타이머 높이 리셋
    fillHeightAnim.setValue(100);
    
    // 타이머가 종료된 메시지를 숨김
    if (showTimeoutMessage) {
      setShowTimeoutMessage(false);
    }
    
    // 타이머 다시 시작
    if (!isRunning) {
      setIsRunning(true);
      startTimer();
    }
  };

  const handlePause = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false);
    } else {
      setIsRunning(true);
      startTimer();
    }
  };

  const handleRestart = () => {
    setPlayers((prevPlayers) => {
      const newPlayers = [...prevPlayers];
      newPlayers[currentPlayerIndex].timeLeft = settings.timerDuration;
      return newPlayers;
    });
    
    // 타이머 높이 리셋
    fillHeightAnim.setValue(100);
    
    // 타이머가 종료된 메시지를 숨김
    if (showTimeoutMessage) {
      setShowTimeoutMessage(false);
    }
    
    if (!isRunning) {
      setIsRunning(true);
      startTimer();
    }
  };

  const handleSettings = () => {
    navigation.navigate('Settings');
  };

  const handleLongPress = () => {
    navigation.navigate('Pause', { 
      currentPlayer: players[currentPlayerIndex],
      settings 
    });
  };

  const formatTime = (time: number) => {
    if (time <= 0) {
      return "00:00:00";
    }
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const milliseconds = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}:${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* 배경 컨테이너 - 어두운 배경 */}
      <View style={styles.backgroundContainer}>
        {/* 플레이어 색상으로 채워지는 영역 - 위에서 아래로 줄어드는 모래시계 효과 */}
        <View style={styles.progressContainer}>
          {/* 플레이어 색상 배경 */}
          <View style={[styles.colorBackground, { backgroundColor: players[currentPlayerIndex].color }]} />
          
          {/* 검은색 오버레이 - 위에서 아래로 덮어내림 (모래시계 효과) */}
          <Animated.View 
            style={[
              styles.blackOverlay, 
              { 
                height: fillHeightAnim.interpolate({
                  inputRange: [0, 100],
                  outputRange: ['100%', '0%'] // 0%일 때 완전히 덮고, 100%일 때 전혀 덮지 않음
                })
              }
            ]}
          />
        </View>
        
        {/* 타이머 내용 */}
        <TouchableOpacity
          style={styles.timerContainer}
          onPress={handlePress}
          onLongPress={handleLongPress}
          delayLongPress={1000}
          activeOpacity={1}
        >
          <View style={styles.content}>
            <Text style={styles.timerText}>
              {formatTime(players[currentPlayerIndex].timeLeft)}
            </Text>
            <Text style={styles.playerName}>
              {players[currentPlayerIndex].name}의 차례
            </Text>
            
            {showTimeoutMessage && (
              <View style={styles.timeoutMessageContainer}>
                <Text style={styles.timeoutMessage}>
                  타이머가 종료되었습니다.
                </Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={handlePause}
        >
          <Text style={styles.buttonText}>
            {isRunning ? '일시정지' : '재개'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleRestart}
        >
          <Text style={styles.buttonText}>다시시작</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.button}
          onPress={handleSettings}
        >
          <Text style={styles.buttonText}>설정</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#262626',
    maxHeight: SCREEN_HEIGHT,
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: '#262626', // 어두운 배경색
    position: 'relative',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  colorBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  blackOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#262626', // 어두운 배경색
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 100, // 버튼 공간 확보
    zIndex: 10, // 내용을 배경 위에 표시
  },
  content: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 40,
    borderRadius: 20,
  },
  timerText: {
    fontSize: SCREEN_HEIGHT * 0.08,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 2,
  },
  playerName: {
    fontSize: SCREEN_HEIGHT * 0.03,
    color: '#FFFFFF',
    marginTop: SCREEN_HEIGHT * 0.02,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    fontWeight: 'bold',
  },
  timeoutMessageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 10,
    marginTop: SCREEN_HEIGHT * 0.04,
  },
  timeoutMessage: {
    color: '#FFFFFF',
    fontSize: SCREEN_HEIGHT * 0.025,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 20,
    zIndex: 20, // 버튼을 항상 위에 표시
  },
  button: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 15,
    borderRadius: 10,
    minWidth: 100,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
}); 