import { Service } from 'diod';
import DeviceDetector, { type DetectResult } from 'node-device-detector';
import { isDesktop, isMobile, isTablet } from 'node-device-detector/helper';

import type { Maybe } from '#/core/types';

import type { UserAgentParseResult, UserAgentParser } from '../domain/user-agent-parser';
import { DEVICE_TYPE, type DeviceType } from '../domain/visit';

function emptyToNull(value: string | undefined): string | null {
	if (!value) {
		return null;
	}

	return value;
}

function mapDeviceType(result: DetectResult): DeviceType {
	if (isMobile(result)) {
		return DEVICE_TYPE.Mobile;
	}

	if (isTablet(result)) {
		return DEVICE_TYPE.Tablet;
	}

	if (isDesktop(result)) {
		return DEVICE_TYPE.Desktop;
	}

	return DEVICE_TYPE.Unknown;
}

@Service()
export class NodeDeviceDetectorUserAgentParser implements UserAgentParser {
	private readonly detector = new DeviceDetector({
		clientIndexes: true,
		deviceIndexes: true,
		osIndexes: true,
	});

	parse(raw: Maybe<string>): Maybe<UserAgentParseResult> {
		if (!raw) {
			return null;
		}

		const bot = this.detector.parseBot(raw);

		if (bot.name) {
			return {
				userAgent: {
					browser: null,
					os: null,
					deviceType: DEVICE_TYPE.Bot,
				},
				isBot: true,
			};
		}

		const result = this.detector.detect(raw);

		return {
			userAgent: {
				browser: emptyToNull(result.client.name),
				os: emptyToNull(result.os.name),
				deviceType: mapDeviceType(result),
			},
			isBot: false,
		};
	}
}
