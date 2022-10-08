import string from './string';
import number from './number';
import boolean from './boolean';
import datetime from './datetime';
import autoCreatedAt from './autoCreatedAt';
import autoUpdatedAt from './autoUpdatedAt';

export const createField = {
    string: string,
    number,
    boolean,
    datetime,
    auto: {
        createdAt: autoCreatedAt,
        updatedAt: autoUpdatedAt,
    },
};